import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    console.log(
      "RESEND_API_KEY:",
      process.env.RESEND_API_KEY ? "OK" : "MISSING"
    );

    const { data, error } = await resend.emails.send({
      from: "FixLog <kontakt@marcinzogrodnik.pl>",
      to: "m.zog@icloud.com", // 👈 zmień na swój adres e-mail testowy
      subject: "🔧 Test Resend API - działa!",
      html: "<p>Jeśli widzisz ten e-mail, to Resend działa poprawnie 🚀</p>",
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    console.log("Email sent:", data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
