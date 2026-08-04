"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api/auth-client";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function LoginForm({ redirectTo = "/account/orders" }: { redirectTo?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const next = searchParams.get("next") ?? redirectTo;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await login(form);

      if (redirectTo.startsWith("/admin") && user.role !== "admin") {
        setError("This account does not have admin access.");
        return;
      }

      router.push(user.role === "admin" && redirectTo.startsWith("/admin") ? "/admin/dashboard" : next);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to sign in."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="py-24">
      <div className="mx-auto max-w-xl space-y-10">
        <SectionHeading
          eyebrow="Account"
          title="Welcome Back"
          description="Sign in to access your cart, wishlist, and bespoke orders."
        />

        <form onSubmit={handleSubmit} className="glass-panel space-y-5 rounded-[1.75rem] p-8">
          <Input
            label="Email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />

          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <p className="text-sm text-stone-700">
            New here?{" "}
            <Link href={`/register?next=${encodeURIComponent(next)}`} className="text-accent hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </Container>
  );
}
