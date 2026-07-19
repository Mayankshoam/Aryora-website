"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post<{ accessToken: string }>("/auth/login", form);
      localStorage.setItem("aryora_token", res.accessToken);
      router.push("/account");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <h1 className="font-display text-3xl mb-2">Welcome Back</h1>
      <p className="text-sm text-ink/60 mb-10">Log in to your Aryora account.</p>

      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-black/10 px-3 py-2 bg-transparent" />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border border-black/10 px-3 py-2 bg-transparent" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Logging in…" : "Log In"}</button>
      </form>

      <p className="text-sm text-ink/60 mt-6">
        New to Aryora? <Link href="/register" className="underline">Create an account</Link>
      </p>
    </div>
  );
}
