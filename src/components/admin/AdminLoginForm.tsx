"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api/auth-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { fadeUp } from "@/lib/motion";

export function AdminLoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await login(form);

      if (user.role !== "admin") {
        setError("This account does not have admin access.");
        return;
      }

      router.push("/admin/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to sign in."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-5"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
    >
      <motion.div variants={fadeUp} className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">Secure access</p>
        <h1 className="font-display text-3xl text-stone-900 sm:text-4xl">Sign in</h1>
        <p className="text-sm leading-relaxed text-stone-600">
          Enter your admin credentials to manage products, orders, and store settings.
        </p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Input
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="username"
          placeholder="admin@velcraft.com"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          className="bg-[#f7f4ef]"
        />
      </motion.div>

      <motion.div variants={fadeUp} className="relative">
        <Input
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          className="bg-[#f7f4ef] pr-16"
        />
        <button
          type="button"
          onClick={() => setShowPassword((open) => !open)}
          className="absolute bottom-3.5 right-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 transition hover:text-accent"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </motion.div>

      {error ? (
        <motion.p
          variants={fadeUp}
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </motion.p>
      ) : null}

      <motion.div variants={fadeUp}>
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? "Signing in..." : "Enter Console"}
        </Button>
      </motion.div>
    </motion.form>
  );
}
