// src/app/(auth)/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, Chrome, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithEmail, signInWithGoogle } from "@/lib/auth";
import { useAuthStore } from "@/store/auth-store";
import { SubmitHandler } from "react-hook-form";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().default(true),
});

type LoginFormValues = z.input<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { firebaseUser, initializing } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
  });

  useEffect(() => {
    if (!initializing && firebaseUser) {
      router.replace("/app/home");
    }
  }, [firebaseUser, initializing, router]);

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setLoading(true);
    setError(null);

    const result = await signInWithEmail(values.email, values.password);

    setLoading(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    router.replace("/app/home");
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    const result = await signInWithGoogle();
    setLoading(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    router.replace("/app/home");
  };

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-white shadow-xl shadow-slate-200/60">
          <div className="rounded-t-3xl bg-gradient-to-br from-blue-600 to-blue-500 px-6 py-8 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white/20 p-3">
                <LogIn className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm/5 text-blue-100">Exit Exam Prep</p>
                <h1 className="text-2xl font-semibold">
                  Let&apos;s pass the exit exam
                </h1>
              </div>
            </div>
          </div>
          <form
            className="space-y-6 px-8 py-10"
            onSubmit={handleSubmit(onSubmit)}
          >
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

            <div className="space-y-1">
              <label
                className="text-sm font-semibold text-slate-600"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className="pr-12"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-slate-600">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  {...register("remember")}
                />
                Remember me
              </label>
              <Link
                href="/reset-password"
                className="font-semibold text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              block
              disabled={loading}
              className="h-12 text-base"
            >
              {loading ? "Signing in..." : "Log in"}
            </Button>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs uppercase tracking-wide text-slate-400">
                or
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Button
              type="button"
              variant="secondary"
              block
              onClick={handleGoogle}
              disabled={loading}
              className="h-12 text-base"
            >
              <Chrome className="mr-2 h-5 w-5" /> Sign in with Google
            </Button>

            <p className="text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-blue-600 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
