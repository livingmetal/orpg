"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (res?.error) {
      setError("Sign-in failed. Check your password.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-20">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <p className="mt-1 text-sm text-neutral-400">
        New email? An account is created on first sign-in.
      </p>
      <form className="mt-6 flex flex-col gap-3" onSubmit={submit}>
        <input
          className="rounded bg-neutral-900 px-3 py-2 text-sm outline-none"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="rounded bg-neutral-900 px-3 py-2 text-sm outline-none"
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          className="rounded bg-sky-600 px-3 py-2 text-sm font-medium disabled:opacity-50"
          disabled={busy}
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
