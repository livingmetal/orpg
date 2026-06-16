"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") return <span className="text-neutral-500">…</span>;

  if (!session?.user) {
    return (
      <Link href="/signin" className="text-sky-400 hover:underline">
        Sign in
      </Link>
    );
  }

  return (
    <span className="flex items-center gap-3">
      <span className="text-neutral-400">{session.user.name ?? session.user.email}</span>
      <button
        className="text-neutral-400 hover:text-neutral-100"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Sign out
      </button>
    </span>
  );
}
