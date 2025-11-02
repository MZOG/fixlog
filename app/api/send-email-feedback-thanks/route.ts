import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { FeedbackThanksToUser } from "@/components/emails/FeedbackThanksToUser";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { to, subject } = await req.json();
    if (!to || !subject) {
      return NextResponse.json(
        { success: false, error: "Brakuje wymaganych pól" },
        { status: 400 }
      );
    }
    const { data, error } = await resend.emails.send({
      from: "FixLog <kontakt+fixlog@marcinzogrodnik.pl>",
      to: to,
      subject: subject,
      react: FeedbackThanksToUser(),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
