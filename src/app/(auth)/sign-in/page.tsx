"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-mono text-xl font-semibold tracking-tight text-fg-primary">
          crest
        </h1>
        <p className="mt-2 text-xs text-fg-muted">
          Sign in to manage your projects
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md border border-accent-strong/30 bg-accent-strong/10 px-3 py-2 text-xs text-accent-strong">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium text-fg-secondary"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1.5 block w-full rounded-md border border-border bg-bg-primary px-3 py-2 font-mono text-sm text-fg-primary placeholder-fg-muted transition-colors focus:border-accent-mid focus:outline-none focus:ring-1 focus:ring-accent-mid"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium text-fg-secondary"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1.5 block w-full rounded-md border border-border bg-bg-primary px-3 py-2 font-mono text-sm text-fg-primary placeholder-fg-muted transition-colors focus:border-accent-mid focus:outline-none focus:ring-1 focus:ring-accent-mid"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-accent-mid px-4 py-2 text-sm font-medium text-bg-primary transition-colors hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent-mid focus:ring-offset-2 focus:ring-offset-bg-elevated disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-center text-xs text-fg-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="text-accent-mid transition-colors hover:text-accent-strong"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
