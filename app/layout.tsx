import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { MainWrapper } from "@/components/MainWrapper";

const onestSans = Onest({
  variable: "--font-onest-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zarządzaj usterkami",
  description: "MVP TODO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${onestSans.className} antialiased`}>
        <HeaderWrapper />
        <MainWrapper>{children}</MainWrapper>
      </body>
    </html>
  );
}
