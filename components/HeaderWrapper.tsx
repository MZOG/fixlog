"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";

export function HeaderWrapper() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");
  const isAlert = pathname.startsWith("/zgloszenie");

  if (isDashboard || isAlert) return null;
  return <Header />;
}
