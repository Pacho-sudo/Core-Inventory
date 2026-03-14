"use client";

import React from "react";
import DeliveryOrderList from "@/components/delivery-orders/DeliveryOrderList";
import { PageContentWrapper } from "@/components/shared";
import { Truck } from "lucide-react";

export default function DeliveryOrdersPage() {
  return (
    <PageContentWrapper>
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1 text-sky-600">
            <Truck className="w-5 h-5" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Delivery Orders</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Manage outgoing stock for customer deliveries.
          </p>
        </div>

        <DeliveryOrderList />
      </div>
    </PageContentWrapper>
  );
}
