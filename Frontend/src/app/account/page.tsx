"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  createdAt: string;
}
interface User {
  fullName: string;
  email: string;
}

const STATUS_STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<{ user: User }>("/auth/me").then((r) => setUser(r.user)).catch(() => setError("Please log in to view your account."));
    api.get<{ orders: Order[] }>("/orders").then((r) => setOrders(r.orders)).catch(() => {});
  }, []);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-sm text-ink/60 mb-4">{error}</p>
        <Link href="/login" className="btn-primary inline-block">Log In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl mb-1">Welcome{user ? `, ${user.fullName}` : ""}</h1>
      <p className="text-sm text-ink/60 mb-12">{user?.email}</p>

      <h2 className="font-display text-xl mb-6">Order Tracking</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-ink/50">No orders yet. <Link href="/shop" className="underline">Start shopping</Link>.</p>
      ) : (
        <div className="space-y-8">
          {orders.map((o) => {
            const stepIndex = STATUS_STEPS.indexOf(o.status);
            return (
              <div key={o.id} className="border border-black/10 p-6">
                <div className="flex justify-between mb-4">
                  <div>
                    <p className="font-display">{o.orderNumber}</p>
                    <p className="text-xs text-ink/50">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm">₹{Number(o.total).toLocaleString("en-IN")}</p>
                </div>
                {stepIndex >= 0 && (
                  <div className="flex items-center gap-2">
                    {STATUS_STEPS.map((s, i) => (
                      <div key={s} className="flex-1">
                        <div className={`h-1 ${i <= stepIndex ? "bg-emerald" : "bg-black/10"}`} />
                        <p className="text-[10px] mt-1 uppercase tracking-wide text-ink/50">{s}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
