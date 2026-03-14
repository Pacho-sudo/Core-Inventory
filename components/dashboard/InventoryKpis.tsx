"use client";

import React, { useEffect, useState } from "react";
import { 
  Package, 
  AlertTriangle, 
  XOctagon, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  RefreshCw 
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface KpiSummary {
  total_products: number;
  low_stock_items: number;
  out_of_stock_items: number;
  pending_receipts: number;
  pending_deliveries: number;
  pending_transfers: number;
}

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  href: string;
  color: string;
}

const KpiCard = ({ title, value, icon: Icon, href, color }: KpiCardProps) => (
  <Link href={href}>
    <Card className="hover:bg-accent/50 transition-colors cursor-pointer border-none bg-background/40 backdrop-blur-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  </Link>
);

export const InventoryKpis = () => {
  const [data, setData] = useState<KpiSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard/summary");
        if (response.ok) {
          const summary = await response.json();
          setData(summary);
        }
      } catch (error) {
        console.error("Failed to fetch KPI summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[100px] w-full bg-background/40" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const kpis = [
    {
      title: "Total Products",
      value: data.total_products,
      icon: Package,
      href: "/admin/products",
      color: "bg-blue-500",
    },
    {
      title: "Low Stock Items",
      value: data.low_stock_items,
      icon: AlertTriangle,
      href: "/admin/inventory/stock",
      color: "bg-amber-500",
    },
    {
      title: "Out of Stock Items",
      value: data.out_of_stock_items,
      icon: XOctagon,
      href: "/admin/inventory/stock",
      color: "bg-red-500",
    },
    {
      title: "Pending Receipts",
      value: data.pending_receipts,
      icon: ArrowDownCircle,
      href: "/admin/operations/receipts",
      color: "bg-emerald-500",
    },
    {
      title: "Pending Deliveries",
      value: data.pending_deliveries,
      icon: ArrowUpCircle,
      href: "/admin/operations/deliveries",
      color: "bg-violet-500",
    },
    {
      title: "Internal Transfers",
      value: data.pending_transfers,
      icon: RefreshCw,
      href: "/admin/operations/internal-transfers",
      color: "bg-cyan-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpis.map((kpi, index) => (
        <KpiCard key={index} {...kpi} />
      ))}
    </div>
  );
};
