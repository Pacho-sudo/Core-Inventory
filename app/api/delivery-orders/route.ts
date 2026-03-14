import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { DeliveryOrderService } from "@/modules/delivery-order/api/delivery-order.service";
import { logger } from "@/lib/logger";

/**
 * GET: Retrieve all delivery orders
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const warehouseId = searchParams.get("warehouseId") || undefined;
    const status = searchParams.get("status") || undefined;

    const orders = await DeliveryOrderService.listOrders({ warehouseId, status });

    // Transform to handle BigInt if any (though DeliveryOrder itself doesn't have BigInt yet)
    // But good practice to use Number() for items' quantities just in case
    const transformedOrders = orders.map((order: any) => ({
      ...order,
      items: (order.items || []).map((item: any) => ({
        ...item,
        quantity: Number(item.quantity)
      }))
    }));

    return NextResponse.json(transformedOrders);
  } catch (error) {
    logger.error("Error fetching delivery orders:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to fetch delivery orders" },
      { status: 500 },
    );
  }
}

/**
 * POST: Create a new delivery order
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { warehouseId, clientId, notes, items } = body;

    if (!warehouseId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Warehouse ID and at least one item are required" },
        { status: 400 },
      );
    }

    const order = await DeliveryOrderService.createOrder({
      warehouseId,
      clientId,
      notes,
      items,
      userId: user.id
    });

    const transformedOrder = {
      ...order,
      items: (order?.items || []).map((item: any) => ({
        ...item,
        quantity: Number(item.quantity)
      }))
    };

    logger.info(`Delivery Order created: ${order?.deliveryNumber}`);
    return NextResponse.json(transformedOrder, { status: 201 });
  } catch (error) {
    logger.error("Error creating delivery order:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create delivery order" },
      { status: 500 },
    );
  }
}
