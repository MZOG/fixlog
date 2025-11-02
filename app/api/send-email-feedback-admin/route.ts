import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { FeedbackThanksToAdmin } from "@/components/emails/FeedbackThanksToAdmin";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { subject, message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json(
        { success: false, error: "Brakuje wymaganych pól" },
        { status: 400 }
      );
    }
    const { data, error } = await resend.emails.send({
      from: `FixLog <${process.env.EMAIL_NO_REPLY}>`,
      to: `${process.env.ADMIN_EMAIL}`,
      subject: subject,
      react: FeedbackThanksToAdmin({ message }),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
