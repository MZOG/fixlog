import { Resend } from "resend";
import { ReporterEmail } from "@/components/emails/ReporterEmail";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    console.log("RAW BODY:", body);

    const { to, subject, description, category } = JSON.parse(body || "{}");
    console.log("Parsed:", { to, subject, description, category });

    if (!to || !subject || !description || !category) {
      return NextResponse.json(
        { success: false, error: "Brakuje wymaganych pól" },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "FixLog <kontakt@marcinzogrodnik.pl>",
      to,
      subject,
      react: ReporterEmail({ category, description }),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    console.log("✅ E-mail sent:", data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("🔥 CATCH ERROR:", error);
    return NextResponse.json(
      { success: false, error: (error as any).message },
      { status: 500 }
    );
  }
}
