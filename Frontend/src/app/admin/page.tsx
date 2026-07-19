"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Summary {
  totalOrders: number; totalRevenue: number; totalCustomers: number; lowStockCount: number;
  topProducts: { productName: string; _sum: { quantity: number } }[];
}
interface Order { id: string; orderNumber: string; status: string; total: string; user: { fullName: string }; }

export default function AdminDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<Summary>("/admin/analytics/summary").then(setSummary).catch(() => setError("Admin access required. Please log in as an admin."));
    api.get<{ orders: Order[] }>("/admin/orders").then((r) => setOrders(r.orders)).catch(() => {});
  }, []);

  if (error) return <p className="max-w-3xl mx-auto px-6 py-24 text-sm text-red-600">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl mb-10">Admin Dashboard</h1>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14">
          {[
            { label: "Total Orders", value: summary.totalOrders },
            { label: "Revenue", value: `₹${Number(summary.totalRevenue).toLocaleString("en-IN")}` },
            { label: "Customers", value: summary.totalCustomers },
            { label: "Low Stock Items", value: summary.lowStockCount },
          ].map((s) => (
            <div key={s.label} className="border border-black/10 p-6">
              <p className="text-xs uppercase tracking-widest2 text-ink/50 mb-2">{s.label}</p>
              <p className="font-display text-2xl">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="font-display text-xl mb-4">Recent Orders</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-ink/50 border-b border-black/10">
            <th className="py-2">Order</th><th>Customer</th><th>Status</th><th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="py-3">{o.orderNumber}</td>
              <td>{o.user?.fullName}</td>
              <td>{o.status}</td>
              <td className="text-right">₹{Number(o.total).toLocaleString("en-IN")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-ink/40 mt-8">
        Full CRUD for products, inventory, coupons, and review moderation is available via the
        <code className="mx-1">/api/admin/*</code> endpoints — wire additional admin screens to these as needed.
      </p>
    </div>
  );
}
