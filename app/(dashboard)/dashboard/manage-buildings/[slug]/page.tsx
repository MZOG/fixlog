import EditPropertyClient from "@/components/dashboard/edit-property";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EditBuilding({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div>
      <Link
        href="/dashboard/manage-buildings"
        className="flex items-center text-sm gap-2 hover:underline"
      >
        <ArrowLeft size={18} />
        Wróć do listy nieruchomości
      </Link>

      <EditPropertyClient slug={slug} />
    </div>
  );
}
