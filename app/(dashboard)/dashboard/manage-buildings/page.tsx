"use client";

import AddProperty from "@/components/dashboard/add-property";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [buildings, setBuildings] = useState<BuildingProps[]>();

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) setUser(user);
  };

  const fetchBuildings = async (userId: string) => {
    try {
      setLoading(true);

      const { data: buildings, error } = await supabase
        .from("buildings")
        .select("*")
        .eq("user_id", userId); // <-- poprawione

      if (error) console.log(error);
      if (buildings) setBuildings(buildings as BuildingProps[]);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-5">
        {buildings &&
          buildings.map((building) => {
            return (
              <Link
                key={building.id}
                href={`/dashboard/manage-buildings/${building.public_id}`}
                className="p-4 py-5 border rounded-md hover:bg-gray-100 cursor-pointer"
              >
                <div className="space-y-4">
                  <div>
                    <Label className="font-normal">Miasto:</Label>
                    <p className="text-sm font-medium">{building.city}</p>
                  </div>

                  <div>
                    <Label className="font-normal">Adres:</Label>
                    <p className="text-sm font-medium">{building.address}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium"></p>
                    <Badge
                      variant="outline"
                      className="text-muted-foreground px-1.5"
                    >
                      {building.name}
                    </Badge>
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

      {/* {buildings && buildings.length > 0 ? (
        <Table className="mt-5 md:mt-8">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Miasto</TableHead>
              <TableHead className="w-[350px]">Adres</TableHead>
              <TableHead>Nazwa inwestycji</TableHead>
              <TableHead>Plakat QR</TableHead>
              <TableHead className="text-right">Zarządzaj</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buildings?.map((building) => {
              const handleGeneratePdf = async () => {
                if (!building.qr_code_data) {
                  // Powiadomienie o braku kodu QR w bazie
                  toast.error("Brak danych kodu QR dla tej nieruchomości.");
                  return;
                }

                const success = await generateQR({
                  buildingName: building.name,
                  qrCodeBase64: building.qr_code_data,
                  publicId: building.public_id,
                });

                if (success) {
                  toast.success("Dokument PDF został wygenerowany.");
                } else {
                  toast.error("Wystąpił błąd podczas generowania PDF.");
                }
              };

              return (
                <TableRow key={building.id}>
                  <TableCell>{building.city}</TableCell>
                  <TableCell className="font-medium">
                    {building.address}
                  </TableCell>
                  <TableCell>{building.name}</TableCell>
                  <TableCell>
                    <div
                      className="cursor-pointer hover:underline font-medium"
                      onClick={handleGeneratePdf}
                    >
                      Pobierz Plakat QR
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link
                        href={`/dashboard/manage-buildings/${building.public_id}`}
                      >
                        Zarządzaj
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <p className="mt-5 md:mt-8">Brak nieruchomości</p>
      )} */}
    </div>
  );
}
