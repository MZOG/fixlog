"use client";

import { usePathname } from "next/navigation";

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");
  const isAlert = pathname.startsWith("/zgloszenie");

  return (
    <main className={isDashboard ? "" : isAlert ? "my-10" : "mt-22"}>
      {children}
    </main>
  );
}
