import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ORPG",
  description: "Online tabletop RPG — chat, dice, character sheets, GM storyboards, LLM assist.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
