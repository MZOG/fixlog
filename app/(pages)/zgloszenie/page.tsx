"use client";
import Head from "next/head";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2Icon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function AlertPage() {
  useEffect(() => {
    document.title = "Dziękujemy za zgłoszenie!";
  }, []);
  const handleClose = () => {
    window.close();
  };

  return (
    <section className="px-5 mx-auto max-w-7xl">
      <Alert>
        <CheckCircle2Icon />
        <AlertTitle>Dziękujemy za zgłoszenie!</AlertTitle>
        <AlertDescription className="mt-1">
          Twoja usterka został przyjęta do systemu.
        </AlertDescription>
      </Alert>

      <div className="flex gap-4 items-center justify-center mt-10">
        <Button asChild>
          <Link href="#">Lista zgłoszeń</Link>
        </Button>
        <Button variant="outline" onClick={handleClose}>
          Zamknij stronę
        </Button>
      </div>
    </section>
  );
}
