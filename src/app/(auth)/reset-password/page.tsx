"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendPasswordResetEmailToUser } from "@/lib/auth";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type ResetValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ResetValues) => {
    setStatus("loading");
    setMessage(null);
    const result = await sendPasswordResetEmailToUser(values.email);
    if (result.success) {
      setStatus("success");
      setMessage("Password reset email sent. Check your inbox.");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }
    setStatus("error");
    setMessage(result.message);
  };

  return (
    <div className="rounded-3xl bg-white shadow-xl shadow-slate-200/60">
      <div className="rounded-t-3xl bg-gradient-to-br from-blue-600 to-blue-500 px-6 py-8 text-white">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white/20 p-3">
            <Mail className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm/5 text-blue-100">Forgot your password?</p>
            <h1 className="text-2xl font-semibold">Reset your credentials</h1>
          </div>
        </div>
      </div>
      <form className="space-y-6 px-8 py-10" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1">
          <label
            className="text-sm font-semibold text-slate-600"
            htmlFor="email"
          >
            Email address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {message && (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${
              status === "success"
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <Button
          type="submit"
          block
          disabled={status === "loading"}
          className="h-12 text-base"
        >
          {status === "loading" ? "Sending reset link..." : "Send reset link"}
        </Button>

        <p className="text-center text-sm text-slate-600">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Back to login
          </Link>
        </p>
      </form>
    </div>
  );
}
