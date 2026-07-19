"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

interface OrderItem { productName: string; quantity: number; unitPrice: string; }
interface OrderDetail {
  orderNumber: string; status: string; total: string; trackingNumber?: string;
  items: OrderItem[]; createdAt: string;
}

export default function OrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<{ order: OrderDetail }>(`/orders/${orderNumber}`).then((r) => setOrder(r.order)).catch(() => setError("Order not found."));
  }, [orderNumber]);

  if (error) return <p className="max-w-2xl mx-auto px-6 py-24 text-sm text-red-600">{error}</p>;
  if (!order) return <p className="max-w-2xl mx-auto px-6 py-24 text-sm text-ink/50">Loading…</p>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <p className="eyebrow mb-2">Order Confirmed</p>
      <h1 className="font-display text-3xl mb-2">{order.orderNumber}</h1>
      <p className="text-sm text-ink/60 mb-8">Status: {order.status}{order.trackingNumber && ` — Tracking: ${order.trackingNumber}`}</p>

      <div className="divide-y divide-black/10 border-t border-b border-black/10 mb-6">
        {order.items.map((i, idx) => (
          <div key={idx} className="flex justify-between py-3 text-sm">
            <span>{i.productName} × {i.quantity}</span>
            <span>₹{Number(i.unitPrice).toLocaleString("en-IN")}</span>
          </div>
        ))}
      </div>
      <p className="text-right font-display text-xl">Total: ₹{Number(order.total).toLocaleString("en-IN")}</p>
    </div>
  );
}
