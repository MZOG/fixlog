"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { PlusCircle } from "lucide-react";
import { customAlphabet } from "nanoid";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

import { z } from "zod";
import { cn } from "@/lib/utils";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const PropertySchema = z.object({
  user_id: z.string().nonempty("Brak ID użytkownika."),
  city: z.string().nonempty("Miasto jest wymagane."),
  address: z.string().nonempty("Adres jest wymagany."),
  name: z.string().nonempty("Nazwa inwestycji jest wymagana."),
  contact_name: z.string().nonempty("Imię i nazwisko zarządcy jest wymagane."),
  contact_email: z
    .string()
    .nonempty("Adres e-mail jest wymagany.")
    .email("Nieprawidłowy adres e-mail."),
  public_id: z.string().nonempty(),
  qr_code_data: z.string().optional(),
});

type NewProperty = z.infer<typeof PropertySchema>;

type AddPropertyProps = {
  refreshBuildings: () => Promise<void>;
};

export default function AddProperty({ refreshBuildings }: AddPropertyProps) {
  const nanoid = customAlphabet("1234567890abcdefghijklmx", 10);
  const [user, setUser] = useState<User | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const [newProperty, setNewProperty] = useState<NewProperty>({
    user_id: "",
    city: "",
    address: "",
    name: "",
    contact_email: "",
    contact_name: "",
    public_id: nanoid(8),
    qr_code_data: "",
  });
  const isMobile = useIsMobile();
  const supabase = createClient();

  const qrContainerRef = useRef<HTMLDivElement>(null);

  const qrLink = `${BASE_URL}/zgloszenie/${newProperty.public_id}`;

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setNewProperty((prev) => ({
          ...prev,
          user_id: user.id,
        }));
      }
    };
    fetchUser();
  }, []);

  const getQrCodeBase64 = (): string => {
    if (qrContainerRef.current) {
      // 1. Znajdź element <svg> wewnątrz kontenera
      const svgElement = qrContainerRef.current.querySelector("svg");

      if (svgElement) {
        const svgString = new XMLSerializer().serializeToString(svgElement);

        try {
          return `data:image/svg+xml;base64,${btoa(svgString)}`;
        } catch (e) {
          console.error("Błąd kodowania Base64:", e);
          return "";
        }
      }
    }
    return "";
  };

  const handleAddProperty = async () => {
    const base64Data = getQrCodeBase64();

    if (!base64Data) {
      toast.error("Błąd generowania kodu QR.");
      return;
    }

    const propertyToInsert = {
      ...newProperty,
      qr_code_data: base64Data,
    };

    const validation = PropertySchema.safeParse(propertyToInsert);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};

      validation.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        fieldErrors[fieldName] = issue.message;
      });

      setErrors(fieldErrors);
      toast.error("Uzupełnij poprawnie wszystkie wymagane pola.");
      return;
    }

    setErrors({});

    const { data, error } = await supabase
      .from("buildings")
      .insert([validation.data])
      .select();

    if (error) {
      console.error(error);
      toast.error("Błąd podczas dodawania nieruchomości");
      return;
    }

    if (data) {
      toast.success("Nieruchomość została dodana!");
      setNewProperty({
        user_id: user?.id || "",
        city: "",
        address: "",
        name: "",
        contact_name: "",
        contact_email: "",
        public_id: nanoid(8),
        qr_code_data: "",
      });
      setOpen(false);
      await refreshBuildings();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setNewProperty((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <Drawer
        direction={isMobile ? "bottom" : "right"}
        open={open}
        onOpenChange={setOpen}
      >
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="text-foreground w-fit px-0 text-left"
          >
            <PlusCircle />
            Dodaj nieruchomość
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="gap-1">
            <DrawerTitle>Dodaj nieruchomość</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
            <form className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="city">Miasto</Label>
                <Input
                  id="city"
                  name="city"
                  onChange={handleChange}
                  className={cn(
                    errors.city && "border-red-500 focus-visible:ring-red-500",
                    "max-sm:h-13"
                  )}
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city}</p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="address">Adres</Label>
                <Input
                  id="address"
                  name="address"
                  onChange={handleChange}
                  className={cn(
                    errors.address &&
                      "border-red-500 focus-visible:ring-red-500",
                    "max-sm:h-13"
                  )}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address}</p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="name">Nazwa inwestycji</Label>
                <Input
                  id="name"
                  name="name"
                  onChange={handleChange}
                  className={cn(
                    errors.name && "border-red-500 focus-visible:ring-red-500",
                    "max-sm:h-13"
                  )}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="contact_name">Osoba zarządzająca</Label>
                <Input
                  id="contact_name"
                  name="contact_name"
                  onChange={handleChange}
                  className={cn(
                    errors.contact_name &&
                      "border-red-500 focus-visible:ring-red-500",
                    "max-sm:h-13"
                  )}
                />
                {errors.contact_name && (
                  <p className="text-sm text-red-500">{errors.contact_name}</p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="contact_email">
                  E-mail osoby zarządzającej *
                </Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  onChange={handleChange}
                  className={cn(
                    errors.contact_email &&
                      "border-red-500 focus-visible:ring-red-500",
                    "max-sm:h-13"
                  )}
                  required
                />
                {errors.contact_email && (
                  <p className="text-sm text-red-500">{errors.contact_email}</p>
                )}
              </div>

              <div className="hidden">
                <Label>Kod QR dla zgłoszeń</Label>
                <p className="text-xs text-muted-foreground">
                  Skanowanie tego kodu przeniesie do formularza zgłoszeniowego
                  pod adresem: <strong>{qrLink}</strong>
                </p>
                <div ref={qrContainerRef}>
                  <QRCodeSVG value={qrLink} size={500} level="H" />
                </div>
              </div>

              <div className="flex-col gap-3 hidden">
                <Label htmlFor="public_id">Publiczny ID</Label>
                <Input
                  id="public_id"
                  name="public_id"
                  value={newProperty.public_id}
                  readOnly
                />
              </div>
            </form>
          </div>
          <DrawerFooter>
            {/* <DrawerClose asChild> */}
            <Button onClick={() => handleAddProperty()}>
              Dodaj nieruchomość
            </Button>
            {/* </DrawerClose> */}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
