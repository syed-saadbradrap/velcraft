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

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const next = searchParams.get("next") ?? "/account/orders";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register(form);
      router.push(next);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to create account."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="py-24">
      <div className="mx-auto max-w-xl space-y-10">
        <SectionHeading
          eyebrow="Account"
          title="Join the Atelier"
          description="Create your account to save designs, manage orders, and checkout bespoke footwear."
        />

        <form onSubmit={handleSubmit} className="glass-panel space-y-5 rounded-[1.75rem] p-8">
          <Input
            label="Full Name"
            name="name"
            required
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            placeholder="+92 300 1234567"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
          <Input
            label="Confirm Password"
            name="password_confirmation"
            type="password"
            required
            minLength={8}
            value={form.password_confirmation}
            onChange={(event) =>
              setForm((current) => ({ ...current, password_confirmation: event.target.value }))
            }
          />

          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? "Creating account..." : "Create Account"}
          </Button>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <p className="text-sm text-stone-700">
            Already have an account?{" "}
            <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </Container>
  );
}
