"use client";

import { createClient } from "@/lib/supabase/client";
import React, { useState } from "react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";

export default function FeedbackForm() {
  const supabase = createClient();
  const { user } = useUser();
  const [message, setMessage] = useState<string>();
  const [loading, setLoading] = useState(false);

  // handle send message
  const handleSend = async () => {
    if (!message || message.trim() === "") {
      toast.error("Wiadomość nie może być pusta.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from("feedback").insert([
        {
          full_name: user?.user_metadata.full_name,
          message,
          email: user?.email,
        },
      ]);

      if (error) {
        toast.error("Wystąpił błąd podczas dodawania opinii");
      } else {
        toast.success("Dziękujemy za opinię");
        setMessage("");

        // handle e-mail to user with thanks
        await fetch("/api/send-email-feedback-thanks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: user?.email,
            subject: `Dziękujemy za przesłanie opinii`,
          }),
        });

        // handle e-mail to superadmin (me)
        await fetch("/api/send-email-feedback-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: user?.email, // adres e-mail admin, create .env
            subject: `Dziękujemy za przesłanie opinii`,
            message: message,
          }),
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="mt-8">
        <p>Ładuję formularz</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-5">
      <Label htmlFor="message">Twoja opinia / sugestia</Label>
      <Textarea
        value={message}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setMessage(e.target.value)
        }
        className="max-w-lg h-30 resize-none"
      />
      <Button disabled={loading} onClick={handleSend}>
        Wyślij opinię
      </Button>
    </div>
  );
}
