import { Resend } from "resend";
import { AdminEmail } from "@/components/emails/AdminNewReport";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { to, subject, description, category, reporter, reporter_email } =
      await req.json();
    if (!to || !subject || !description || !category) {
      return NextResponse.json(
        { success: false, error: "Brakuje wymaganych pól" },
        { status: 400 }
      );
    }
    const { data, error } = await resend.emails.send({
      from: "FixLog <kontakt+fixlog@marcinzogrodnik.pl>",
      to: to,
      subject: subject,
      react: AdminEmail({
        category: category,
        description: description,
        reporter: reporter,
        reporter_email: reporter_email,
      }),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
