export const metadata: Metadata = {
  title: "Zgłoś awarię / usterkę",
  description: "MVP TODO",
};

import NewAlertClient from "@/components/NewAlertClient";
import { Metadata } from "next";

export default async function NewAlertPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <NewAlertClient slug={slug} />;
}
