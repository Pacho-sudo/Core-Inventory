import { prisma } from "../prisma/client";
import { DeliveryOrderService } from "../modules/delivery-order/api/delivery-order.service";

async function testDeliveryOrder() {
  console.log("🚀 Testing Delivery Order Module...");

  try {
    // 1. Get a test user, warehouse, and product
    const user = await prisma.user.findFirst();
    const warehouse = await prisma.warehouse.findFirst();
    const product = await prisma.product.findFirst();

    if (!user || !warehouse || !product) {
      console.error("❌ Test data not found (user, warehouse, or product missing)");
      return;
    }

    console.log(`Using Warehouse: ${warehouse.name}, Product: ${product.name}`);

    // 2. Initial Stock
    const initialStock = await prisma.stock.findUnique({
      where: { productId_warehouseId: { productId: product.id, warehouseId: warehouse.id } }
    });
    console.log(`Initial Stock: ${initialStock?.quantity || 0}`);

    // 3. Create Delivery Order
    console.log("Creating Delivery Order...");
    const order = await DeliveryOrderService.createOrder({
      warehouseId: warehouse.id,
      userId: user.id,
      notes: "Test Delivery",
      items: [
        { productId: product.id, quantity: 1 }
      ]
    });
    console.log(`Delivery Order Created: ${order?.deliveryNumber}`);

    // 4. Validate Delivery
    console.log("Validating Delivery...");
    if (order) {
        await DeliveryOrderService.validateOrder(order.id, user.id);
        console.log("Delivery Validated.");
    }

    // 5. Verify Stock Deduction
    const finalStock = await prisma.stock.findUnique({
      where: { productId_warehouseId: { productId: product.id, warehouseId: warehouse.id } }
    });
    console.log(`Final Stock: ${finalStock?.quantity || 0}`);

    const diff = (initialStock?.quantity || 0) - (finalStock?.quantity || 0);
    if (diff === 1) {
      console.log("✅ SUCCESS: Stock deducted correctly.");
    } else {
      console.error(`❌ FAILURE: Expected 1 unit deduction, got ${diff}`);
    }

    // 6. Verify Movement
    const movement = await prisma.stockMovement.findFirst({
        where: { referenceId: order?.id },
        orderBy: { createdAt: 'desc' }
    });
    if (movement && movement.movementType === 'DELIVERY') {
        console.log("✅ SUCCESS: Stock movement logged.");
    } else {
        console.error("❌ FAILURE: Stock movement not found or incorrect type.");
    }

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDeliveryOrder();
