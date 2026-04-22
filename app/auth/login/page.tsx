"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setMessage("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage("Something went wrong while signing in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Login" subtitle="Authenticate with Supabase Auth">
      <Card>
        <form onSubmit={handleSubmit} className="grid max-w-md gap-4">
          <label className="grid gap-1 text-sm">
            <span>Email</span>
            <input
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
              name="email"
              type="email"
              placeholder="owner@store.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span>Password</span>
            <input
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {message && (
            <p className="text-sm text-red-600">{message}</p>
          )}

          <button
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </Card>
    </AppShell>
  );
}