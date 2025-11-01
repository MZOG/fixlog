"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LogoutPage = () => {
  const router = useRouter();
  useEffect(() => {
    setTimeout(() => router.push("/"), 2000);
  }, []);
  return (
    <section className="px-5 mx-auto max-w-5xl flex justify-center mt-20">
      <p>Zostałeś wylogowany, za chwilę nastąpi przekierowanie.</p>
    </section>
  );
};

export default LogoutPage;
