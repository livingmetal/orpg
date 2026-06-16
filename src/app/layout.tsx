import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./providers";
import { AuthStatus } from "@/components/AuthStatus";

export const metadata: Metadata = {
  title: "ORPG",
  description: "Online tabletop RPG — chat, dice, character sheets, GM storyboards, LLM assist.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <header className="flex items-center justify-between border-b border-neutral-800 px-4 py-2 text-sm">
            <Link href="/" className="font-semibold">
              ORPG
            </Link>
            <AuthStatus />
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
