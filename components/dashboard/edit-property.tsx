"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState } from "react";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import { generateQR } from "./pdf-generator";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";

const BuildingSchema = z.object({
  id: z.string(),
  public_id: z.string(),
  user_id: z.string(),
  city: z.string().nonempty("Miasto jest wymagane"),
  address: z.string().nonempty("Adres jest wymagany"),
  name: z.string(),
  qr_code_data: z.string().optional(),
  contact_name: z.string().nonempty("Osoba kontaktowa jest wymagana"),
  contact_email: z.email().nonempty("Adre e-mail jest wymagany"),
  contacts: z.array(
    z.object({
      label: z.string(),
      phone: z.string(),
    })
  ),
});

type BuildingProps = z.infer<typeof BuildingSchema>;

export default function EditPropertyClient({ slug }: { slug: string }) {
  const [building, setBuilding] = useState<BuildingProps | null>(null);
  const [contacts, setContacts] = useState<
    { id: number; label: string; phone: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const supabase = createClient();

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const qrLink = `${BASE_URL}/zgloszenie/${building?.public_id}`;
  const qrContainerRef = useRef<HTMLDivElement>(null);

  const fetchBuilding = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("buildings")
        .select("*")
        .eq("public_id", slug)
        .single();

      if (error) throw error;
      if (data) {
        setBuilding(data);
        setContacts(
          data.contacts
            ? data.contacts.map((c: any, i: number) => ({
                id: i + 1,
                ...c,
              }))
            : [{ id: 1, label: "", phone: "" }]
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Błąd podczas pobierania danych budynku");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuilding();
  }, [slug]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!building) return;
    setBuilding((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleContactChange = (
    id: number,
    field: "label" | "phone",
    value: string
  ) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const addContact = () => {
    setContacts((prev) => [...prev, { id: Date.now(), label: "", phone: "" }]);
  };

  const removeContact = (id: number) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSave = async () => {
    if (!building) return;

    const updatedData = {
      ...building,
      contacts: contacts.map(({ id, ...rest }) => rest),
    };

    const validation = BuildingSchema.safeParse(updatedData);

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

    const { error } = await supabase
      .from("buildings")
      .update(validation.data)
      .eq("public_id", slug);

    if (error) {
      console.error(error);
      toast.error("Błąd aktualizacji danych.");
    } else {
      toast.success("Dane zostały zaktualizowane!");
      fetchBuilding();
    }
  };

  const getQrCodeBase64_SVG = (): string => {
    if (qrContainerRef.current) {
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

  const handleGenerateQrCode = async () => {
    if (!building) return;
    setIsGenerating(true);
    toast.info("Generowanie i zapisywanie kodu QR...");

    await new Promise((resolve) => setTimeout(resolve, 50));
    const base64Data = getQrCodeBase64_SVG();
    if (!base64Data) {
      toast.error("Błąd generowania QR");
      setIsGenerating(false);
      return;
    }

    const { error } = await supabase
      .from("buildings")
      .update({ qr_code_data: base64Data })
      .eq("public_id", slug);

    if (error) {
      console.error(error);
      toast.error("Błąd zapisu kodu QR w bazie.");
    } else {
      toast.success("Kod QR zapisany!");
      setBuilding((prev) =>
        prev ? { ...prev, qr_code_data: base64Data } : null
      );
    }
    setIsGenerating(false);
  };

  const handleGeneratePdf = async () => {
    if (!building?.qr_code_data) {
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

  if (loading || !building)
    return (
      <div className="mt-5 flex justify-center">
        <p>Ładowanie danych...</p>
      </div>
    );

  return (
    <div className="mt-5 max-w-4xl mx-auto">
      <FieldGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field>
            <FieldLabel htmlFor="city">Miasto</FieldLabel>
            <Input
              id="city"
              name="city"
              value={building.city || ""}
              onChange={handleChange}
            />
            {errors.city && (
              <p className="text-sm text-red-500">{errors.city}</p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="address">Adres</FieldLabel>
            <Input
              id="address"
              name="address"
              value={building.address || ""}
              onChange={handleChange}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address}</p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="name">Nazwa inwestycji</FieldLabel>
            <Input
              id="name"
              name="name"
              value={building.name || ""}
              onChange={handleChange}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="contact_name">Osoba zarządzająca</FieldLabel>
            <Input
              id="contact_name"
              name="contact_name"
              value={building.contact_name || ""}
              onChange={handleChange}
            />
            {errors.contact_name && (
              <p className="text-sm text-red-500">{errors.contact_name}</p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="contact_email">
              E-mail osoby zarządzającej
            </FieldLabel>
            <Input
              id="contact_email"
              name="contact_email"
              value={building.contact_email || ""}
              onChange={handleChange}
            />
            {errors.contact_email && (
              <p className="text-sm text-red-500">{errors.contact_email}</p>
            )}
          </Field>

          <Field className="self-start">
            <FieldLabel htmlFor="qr_code_data">
              Kod QR (do wydrukowania)
            </FieldLabel>
            {building.qr_code_data ? (
              <Button onClick={handleGeneratePdf}>
                Pobierz kod QR w formacie PDF
              </Button>
            ) : (
              <div className="flex flex-col gap-3">
                <div
                  ref={qrContainerRef}
                  style={{
                    width: 0,
                    height: 0,
                    overflow: "hidden",
                    visibility: "hidden",
                    position: "absolute",
                  }}
                >
                  <QRCodeSVG value={qrLink} size={150} level="H" />
                </div>

                <Button onClick={handleGenerateQrCode} disabled={isGenerating}>
                  {isGenerating ? "Generowanie..." : "Wygeneruj kod QR"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Po wygenerowaniu, obraz QR zostanie zapisany w bazie danych.
                </p>
              </div>
            )}
          </Field>
        </div>

        <Separator className="my-6" />

        <FieldGroup>
          <h3 className="text-lg font-medium">Dodatkowe kontakty</h3>
          <div className="text-muted-foreground text-sm mb-2">
            <p>
              W tym miejscu możesz dodać kontakty w celu szybszego kontaktu.
            </p>
            <p>Kontakty będą widoczne w widoku zgłoszenia.</p>
          </div>
          {contacts.map((contact) => (
            <div key={contact.id} className="flex gap-2 mb-3">
              <Field className="flex-1">
                <FieldLabel>Nazwa</FieldLabel>
                <Input
                  value={contact.label || ""}
                  onChange={(e) =>
                    handleContactChange(contact.id, "label", e.target.value)
                  }
                  placeholder="np. Elektryk"
                />
              </Field>

              <Field className="flex-1">
                <FieldLabel>Telefon</FieldLabel>
                <Input
                  value={contact.phone || ""}
                  onChange={(e) =>
                    handleContactChange(contact.id, "phone", e.target.value)
                  }
                  placeholder="np. 500 600 700"
                />
              </Field>

              <Field className="w-10 self-end">
                <Button
                  variant="destructive"
                  onClick={() => removeContact(contact.id)}
                >
                  <Trash2 />
                </Button>
              </Field>
            </div>
          ))}

          <Button className="self-start" variant="outline" onClick={addContact}>
            <Plus size={14} /> Dodaj kontakt
          </Button>
        </FieldGroup>
      </FieldGroup>

      <div className="mt-10 flex justify-center">
        <Button onClick={handleSave}>Aktualizuj</Button>
      </div>
    </div>
  );
}
