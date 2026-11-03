"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminProductsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] text-xs text-[#666666]">
      Redirecting to Master Admin Console...
    </div>
  );
}
