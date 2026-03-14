import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { DeliveryOrderService } from "@/modules/delivery-order/api/delivery-order.service";
import { logger } from "@/lib/logger";

/**
 * GET: Retrieve a single delivery order detail
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const order = await DeliveryOrderService.getOrder(id);

    if (!order) {
      return NextResponse.json({ error: "Delivery order not found" }, { status: 404 });
    }

    // Transform to handle BigInt in product quantities
    const transformedOrder = {
      ...order,
      items: (order.items || []).map((item: any) => ({
        ...item,
        quantity: Number(item.quantity),
        product: item.product ? {
          ...item.product,
          quantity: Number(item.product.quantity),
          reservedQuantity: Number(item.product.reservedQuantity || 0)
        } : null
      }))
    };

    return NextResponse.json(transformedOrder);
  } catch (error) {
    logger.error("Error fetching delivery order details:", {
      orderId: (await params).id,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to fetch delivery order" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/delivery-orders/[id]/validate
 * Validates the delivery, deducts stock, and records movement.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await req.json();

    if (action !== "validate") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const order = await DeliveryOrderService.validateOrder(id, user.id);

    const transformedOrder = {
      ...order,
      items: (order.items || []).map((item: any) => ({
        ...item,
        quantity: Number(item.quantity)
      }))
    };

    logger.info(`Delivery Order validated: ${order.deliveryNumber}`);
    return NextResponse.json(transformedOrder);
  } catch (error) {
    logger.error("Error validating delivery order:", {
      orderId: (await params).id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to validate delivery order" },
      { status: 500 },
    );
  }
}
