"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "./ui/field";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Image as AddImage } from "lucide-react";
import Image from "next/image";

type BuildingProps = {
  id: number;
  public_id: string | number;
  user_id: string;
  city: string;
  address: string;
  contact_email: string;
  name: string;
  qr_code_data: string | null;
};

type NewAlertProps = {
  title: string;
  category: string;
  status: string;
  reporter: string;
  reporter_email: string;
  description: string;
  images: string[];
};

export default function NewAlertClient({ slug }: { slug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const public_id = pathname.replace("/zgloszenie/", "") || slug;
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [building, setBuilding] = useState<BuildingProps>();

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [alert, setAlert] = useState<NewAlertProps>({
    title: "",
    category: "",
    status: "Nowy",
    reporter: "",
    reporter_email: "",
    images: [],
    description: "",
  });

  const fetchBulding = async (id: number | string) => {
    try {
      setLoading(true);
      if (!id) return;

      const { data: building, error } = await supabase
        .from("buildings")
        .select("*")
        .eq("public_id", id)
        .maybeSingle();

      if (error) console.log(error);
      if (building) setBuilding(building as BuildingProps);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBulding(public_id);
  }, [public_id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setAlert((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!building) return;

    if (!building.id) {
      toast.error(
        "Błąd: Nie udało się powiązać zgłoszenia z nieruchomością. Brak ID obiektu."
      );
      console.error("Błąd: building.id jest null/undefined.");
      return;
    }

    if (!alert.title || !alert.category || !alert.reporter) {
      toast.error(
        "Proszę wypełnić wszystkie wymagane pola (Tytuł, Kategoria, Imię)."
      );
      return;
    }

    let imagePath: string | null = null;
    if (photo) {
      const filePath = `alerts/${Date.now()}-${photo.name}`;
      const { error: uploadError } = await supabase.storage
        .from("alerts-images")
        .upload(filePath, photo);

      if (uploadError) {
        console.error(uploadError);
        toast.error("Nie udało się wysłać zdjęcia.");
      } else {
        imagePath = filePath;
      }
    }

    const alertPayload = {
      ...alert,
      building_id: building?.id,
      images: imagePath,
    };

    const { error } = await supabase
      .from("alerts")
      .insert([alertPayload])
      .select()
      .single();

    if (error) {
      console.error(error);
      toast.error("Błąd aktualizacji danych.");
    } else {
      setAlert({
        title: "",
        category: "",
        status: "Nowy",
        reporter: "",
        reporter_email: "",
        images: [],
        description: "",
      });

      try {
        if (alert.reporter_email) {
          await fetch("/api/send-email-to-reporter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: alert.reporter_email,
              subject: `Twoje zgłoszenie zostało przyjęte: ${alert.title}`,
              category: alert.category,
              description: alert.description,
            }),
          });
        }

        if (building?.contact_email) {
          await fetch("/api/send-email-to-home-owner", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: building.contact_email,
              subject: `Nowe zgłoszenie w budynku: ${building.name}`,
              category: alert.category,
              description: alert.description,
              reporter: alert.reporter,
              reporter_email: alert.reporter_email,
            }),
          });
        }
      } catch (error) {
        console.error("Błąd wysyłki maili:", error);
        toast.error("Nie udało się wysłać powiadomień e-mail.");
      }

      router.push("/zgloszenie");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  if (loading) {
    return (
      <div>
        <p>Moment..</p>
      </div>
    );
  }

  return (
    <section className="px-5 mx-auto max-w-7xl">
      <h1 className="text-2xl font-medium">Nowe zgłoszenie / awaria</h1>

      <FieldGroup className="mt-5">
        <Field className="gap-0">
          <FieldLabel htmlFor="address">Adres</FieldLabel>
          <p>{building?.address}</p>
        </Field>

        <Field className="gap-0">
          <FieldLabel htmlFor="name">Nazwa inwestycji</FieldLabel>
          <p>{building?.name}</p>
        </Field>

        <Separator />

        <Field>
          <FieldLabel htmlFor="title">Tytuł</FieldLabel>
          <Input
            id="title"
            name="title"
            onChange={handleChange}
            autoComplete="off"
            className="h-13"
            placeholder="np. Uszkodzona winda"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="category">Kategoria</FieldLabel>
          <Select
            value={alert.category}
            onValueChange={(value) => {
              setAlert((prev) => ({ ...prev, category: value }));
            }}
          >
            <SelectTrigger className="w-[180px] h-13!">
              <SelectValue placeholder="Wybierz kategorię" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Awaria">Awaria</SelectItem>
                <SelectItem value="Usterka">Usterka</SelectItem>
                <SelectItem value="Prąd">Prąd</SelectItem>
                <SelectItem value="Woda">Woda</SelectItem>
                <SelectItem value="Inne">Inne</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Opis</FieldLabel>
          <Textarea
            id="description"
            name="description"
            onChange={handleChange}
            autoComplete="off"
            className="h-30"
            placeholder="Opisz w kilku zdaniach usterkę / awarię"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="photo">Zdjęcie (opcjonalnie)</FieldLabel>
          <Input
            type="file"
            id="photo"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {photoPreview ? (
            <div className="mt-4 relative h-70 rounded-lg">
              <Image
                src={photoPreview}
                fill
                alt="Podgląd zdjęcia"
                className="rounded-lg h-60 object-contain"
              />
            </div>
          ) : (
            <Button
              variant="outline"
              className="h-13"
              type="button"
              onClick={() => document.getElementById("photo")?.click()}
            >
              <AddImage />
              Dodaj zdjęcie
            </Button>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="reporter">Twoje imię i nazwisko</FieldLabel>
          <Input
            id="reporter"
            name="reporter"
            onChange={handleChange}
            autoComplete="off"
            className="h-13"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="reporter_email">E-mail</FieldLabel>
          <Input
            id="reporter_email"
            autoComplete="off"
            name="reporter_email"
            onChange={handleChange}
            className="h-13"
            placeholder="marcin@gmail.com"
          />
          <FieldDescription>
            Podaj swój adres e-mail, jeżeli chcesz otrzymać aktualizację
            zgłoszenia.
          </FieldDescription>
        </Field>
      </FieldGroup>

      <div className="mt-10 flex justify-center">
        <Button size="lg" className="text-lg font-normal" onClick={handleSave}>
          Zgłaszam
        </Button>
      </div>
    </section>
  );
}
