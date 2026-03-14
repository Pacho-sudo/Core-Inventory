import { prisma } from "./client";
import { DeliveryOrder, DeliveryOrderItem, StockMovementType } from "@prisma/client";
import { StockService } from "@/modules/stock/api/stock.service";

export interface CreateDeliveryOrderInput {
  warehouseId: string;
  clientId?: string;
  userId: string;
  notes?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export async function createDeliveryOrder(data: CreateDeliveryOrderInput) {
  // Generate delivery number (DEL-YYYYMMDD-XXXX)
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const count = await prisma.deliveryOrder.count({
    where: {
      deliveryNumber: {
        startsWith: `DEL-${dateStr}`,
      },
    },
  });
  const deliveryNumber = `DEL-${dateStr}-${(count + 1)
    .toString()
    .padStart(4, "0")}`;

  // 1. Create the delivery order
  const deliveryOrder = await prisma.deliveryOrder.create({
    data: {
      deliveryNumber,
      warehouseId: data.warehouseId,
      clientId: data.clientId,
      userId: data.userId,
      notes: data.notes,
      status: "pending",
    },
  });

  // 2. Create items
  // Fetch product details for snapshot
  const productIds = data.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  for (const item of data.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product)
      throw new Error(`Product with ID ${item.productId} not found`);

    await prisma.deliveryOrderItem.create({
      data: {
        deliveryOrderId: deliveryOrder.id,
        productId: item.productId,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
      },
    });
  }

  return await prisma.deliveryOrder.findUnique({
    where: { id: deliveryOrder.id },
    include: { items: true },
  });
}

export async function validateDelivery(id: string, userId: string) {
  const delivery = await prisma.deliveryOrder.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!delivery) throw new Error("Delivery order not found");
  if (delivery.status !== "pending")
    throw new Error("Only pending deliveries can be validated");

  // Process each item
  for (const item of delivery.items) {
    // 1. Check stock in warehouse
    const stock = await prisma.stock.findUnique({
      where: {
        productId_warehouseId: {
          productId: item.productId,
          warehouseId: delivery.warehouseId,
        },
      },
    });

    if (!stock || stock.quantity < item.quantity) {
      throw new Error(
        `Insufficient stock for product ${item.productName} in selected warehouse`,
      );
    }

    // 2. Deduct stock from warehouse
    await prisma.stock.update({
      where: { id: stock.id },
      data: {
        quantity: { decrement: item.quantity },
      },
    });

    // 3. Update global product quantity
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        quantity: { decrement: BigInt(item.quantity) },
      },
    });

    // 4. Record movement
    await prisma.stockMovement.create({
      data: {
        productId: item.productId,
        movementType: StockMovementType.DELIVERY,
        quantity: -item.quantity, // Negative for delivery
        sourceWarehouseId: delivery.warehouseId,
        referenceType: "Delivery Order",
        referenceId: delivery.id,
        userId: userId,
        notes: `Delivery Order ${delivery.deliveryNumber}`,
      },
    });
  }

  // Update status
  return await prisma.deliveryOrder.update({
    where: { id },
    data: {
      status: "validated",
      updatedAt: new Date(),
    },
    include: { items: true },
  });
}

export async function getDeliveryOrders(filters: { warehouseId?: string; status?: string }) {
  return await prisma.deliveryOrder.findMany({
    where: {
      AND: [
        filters.warehouseId ? { warehouseId: filters.warehouseId } : {},
        filters.status ? { status: filters.status } : {},
      ],
    },
    include: {
      items: true,
      warehouse: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDeliveryOrderDetail(id: string) {
  return await prisma.deliveryOrder.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              sku: true,
              imageUrl: true,
            },
          },
        },
      },
      warehouse: true,
    },
  });
}
