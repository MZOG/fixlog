"use client";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export function useUser() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>();
  const [userLoading, setUserLoading] = useState(false);

  const fetchUser = async () => {
    setUserLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error(error);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    userLoading,
  };
}
