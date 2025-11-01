"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { toast } from "sonner";

export default function FeedbackForm() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>();
  const [message, setMessage] = useState<string>();
  const [loading, setLoading] = useState(false);

  // get user info
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getSession();
  }, []);

  // handle send message
  const handleSend = async () => {
    if (!message || message.trim() === "") {
      toast.error("Wiadomość nie może być pusta.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from("feedback")
        .insert([{ full_name: user?.user_metadata.full_name, message }]);

      if (error) {
        toast.error("Wystąpił błąd podczas dodawania opinii");
      } else {
        toast.success("Dziękujemy za opinię");
        // reset textarea
        setMessage("");
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
