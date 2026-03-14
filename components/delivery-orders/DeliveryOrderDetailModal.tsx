"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  Warehouse, 
  Calendar, 
  User, 
  FileText, 
  CheckCircle, 
  Clock, 
  Loader2 
} from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DeliveryOrderDetailModalProps {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onValidate: () => void;
}

export function DeliveryOrderDetailModal({ 
  orderId, 
  open, 
  onOpenChange,
  onValidate
}: DeliveryOrderDetailModalProps) {
  const { data: order, isLoading } = useQuery({
    queryKey: ["delivery-order", orderId],
    queryFn: async () => {
      const res = await fetch(`/api/delivery-orders/${orderId}`);
      if (!res.ok) throw new Error("Failed to fetch order details");
      return res.json();
    },
    enabled: !!orderId && open
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "validated":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Validated</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0 border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-sky-600" />
              <DialogTitle className="text-xl">Delivery Order: {order?.deliveryNumber}</DialogTitle>
            </div>
            {order && getStatusBadge(order.status)}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-10">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : order ? (
          <>
            <div className="flex-1 p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Warehouse className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Source Warehouse</p>
                      <p className="font-semibold text-lg">{order.warehouse?.name}</p>
                      <p className="text-sm text-muted-foreground">{order.warehouse?.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Created At</p>
                      <p className="font-medium">{format(new Date(order.createdAt), "PPP p")}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</p>
                      <p className="text-sm italic">{order.notes || "No notes provided."}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Products Included</h3>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                          <TableCell className="text-right font-bold text-lg">{item.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {order.status === "pending" && (
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Action Required:</strong> Validating this delivery will immediately deduct 
                    the quantities from the <strong>{order.warehouse?.name}</strong> stock and create transaction records.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="p-6 border-t bg-muted/5">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {order.status === "pending" && (
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={onValidate}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm & Validate Delivery
                </Button>
              )}
            </DialogFooter>
          </>
        ) : (
          <div className="p-10 text-center text-muted-foreground">
            Could not load delivery order details.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
