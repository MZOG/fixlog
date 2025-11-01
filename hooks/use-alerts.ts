"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AlertWithBuilding = {
  id: number;
  title: string;
  status: string;
  category: string;
  reporter: string;
  created_at: string;
  building_id: number;
  images: string;
  description: string;
  buildings: {
    // this is just one building
    id: number;
    name: string;
    address: string;
    city: string;
    user_id: string;
    contacts: {
      label: string;
      phone: string;
    }[];
    contact_name: string;
    contact_email: string;
  };
};

export function useAlerts() {
  const [alerts, setAlerts] = useState<AlertWithBuilding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, [supabase]);

  const fetchAlerts = useCallback(async () => {
    if (!user) {
      throw new Error("User is required for fetching alerts");
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("alerts")
        .select(
          `
          id,
          title,
          status,
          category,
          reporter,
          created_at,
          building_id,
          description,
          images,
          buildings!alerts_building_id_fkey (
            id,
            name,
            address,
            city,
            user_id,
            contacts,
            contact_name,
            contact_email
          )
        `
        )
        .eq("buildings.user_id", user.id)
        .order("created_at", { ascending: false })
        .returns<AlertWithBuilding[]>();

      if (error) throw error;

      if (data) {
        setAlerts(data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [user, fetchAlerts]);

  const updateAlertStatus = async (id: number, status: string) => {
    const { error } = await supabase
      .from("alerts")
      .update({ status })
      .eq("id", id);

    if (error) throw error;

    setAlerts((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, status } : a));
      return updated;
    });
  };

  const removeAlertLocally = (id: number) => {
    setAlerts((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      return updated;
    });
  };

  return {
    alerts,
    loading,
    error,
    updateAlertStatus,
    removeAlertLocally,
  };
}
