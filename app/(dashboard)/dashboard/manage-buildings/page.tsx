"use client";

import AddProperty from "@/components/dashboard/add-property";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { useUser } from "@/hooks/use-user";

type BuildingProps = {
  id: string;
  public_id: string;
  user_id: string;
  city: string;
  address: string;
  name: string;
  qr_code_data: string;
  contact_name: string;
};

export default function ManageBuildingsPage() {
  const supabase = createClient();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [buildings, setBuildings] = useState<BuildingProps[]>();

  const fetchBuildings = async (userId: string) => {
    try {
      setLoading(true);

      const { data: buildings, error } = await supabase
        .from("buildings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) console.log(error);
      if (buildings) setBuildings(buildings as BuildingProps[]);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchBuildings(user.id);
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex justify-center">
        <p>Ładowanie danych...</p>
      </div>
    );
  }

  if (!buildings || buildings.length === 0) {
    return (
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
        <h1 className="text-xl font-medium">Brak nieruchomości</h1>
        <AddProperty refreshBuildings={() => user && fetchBuildings(user.id)} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
        <h1 className="text-xl font-medium">Zarządzaj nieruchomościami</h1>
        <AddProperty refreshBuildings={() => user && fetchBuildings(user.id)} />
      </div>

      <div className="grid grid-cols-1 gap-3 mt-5">
        {buildings &&
          buildings.map((building) => {
            return (
              <Link
                key={building.id}
                href={`/dashboard/manage-buildings/${building.public_id}`}
                className="p-4 py-5 border rounded-md hover:bg-gray-100 cursor-pointer"
              >
                <div className="grid sm:grid-cols-2 md:grid-cols-3 items-center gap-5">
                  <div>
                    <Label className="font-normal">Miasto:</Label>
                    <p className="text-sm font-medium">{building.city}</p>
                  </div>

                  <div>
                    <Label className="font-normal">Adres:</Label>
                    <p className="text-sm font-medium">{building.address}</p>
                  </div>

                  <div>
                    <Label className="font-normal">Osoba zarządzająca:</Label>
                    <p className="text-sm font-medium">
                      {building.contact_name || "Brak - dodaj osobę!"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
      </div>
    </div>
  );
}
