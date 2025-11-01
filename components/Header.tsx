"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Building, Menu, User2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const menuItems = [
  { label: "Jak to działa?", href: "/funkcjonalnosci" },
  { label: "Cennik", href: "/cennik" },
  { label: "Kontakt", href: "/kontakt" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const supabase = createClient();

    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  });

  return (
    <header className="fixed top-0 z-50 w-full bg-background/5 backdrop-blur-sm">
      <div className="px-5 mx-auto max-w-7xl flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Building size={20} strokeWidth={1.75} />
          <span className="font-medium text-sm">FixLog</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {menuItems.map((item) => (
            <Button asChild variant="ghost" key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
          {isLoggedIn ? (
            <Button asChild className="ml-3">
              <Link href="/dashboard">
                <User2 />
                Panel
              </Link>
            </Button>
          ) : (
            <Button asChild className="ml-3">
              <Link href="/login">
                <User2 />
                Zaloguj się
              </Link>
            </Button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container flex flex-col gap-4 px-4 py-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className="text-base font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <Button asChild className="w-full">
                <Link href="/dashboard" onClick={handleNavClick}>
                  Panel
                </Link>
              </Button>
            ) : (
              <Button asChild className="w-full">
                <Link href="/login" onClick={handleNavClick}>
                  Zaloguj się
                </Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
