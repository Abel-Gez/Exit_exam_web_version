"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUpWithEmail, signInWithGoogle } from "@/lib/auth";
import { useAuthStore } from "@/store/auth-store";

const schema = z
  .object({
    fullName: z.string().min(2, "Please enter your full name"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpFormValues = z.infer<typeof schema>;

export default function SignUpPage() {
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (firebaseUser) {
      router.replace("/app/home");
    }
  }, [firebaseUser, router]);

  const onSubmit = async (values: SignUpFormValues) => {
    setLoading(true);
    setError(null);
    const result = await signUpWithEmail(values.email, values.password, values.fullName.trim());
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

  return (
    <div className="rounded-3xl bg-white shadow-xl shadow-slate-200/60">
      <div className="rounded-t-3xl bg-gradient-to-br from-blue-600 to-blue-500 px-6 py-8 text-white">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white/20 p-3">
            <UserPlus className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm/5 text-blue-100">Create your account</p>
            <h1 className="text-2xl font-semibold">Join Exit Exam Prep</h1>
          </div>
        </div>
      </div>
      <form className="space-y-6 px-8 py-10" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-600" htmlFor="fullName">
            Full name
          </label>
          <Input id="fullName" placeholder="Jane Doe" {...register("fullName")}
          />
          {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-600" htmlFor="email">
            Email address
          </label>
          <Input id="email" type="email" placeholder="you@example.com" {...register("email")}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-600" htmlFor="password">
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
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-600" htmlFor="confirmPassword">
            Confirm password
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              {...register("confirmPassword")}
              className="pr-12"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
              onClick={() => setShowConfirm((prev) => !prev)}
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        <Button type="submit" block disabled={loading} className="h-12 text-base">
          {loading ? "Creating account..." : "Sign up"}
        </Button>

        <Button
          type="button"
          variant="secondary"
          block
          onClick={handleGoogle}
          disabled={loading}
          className="h-12 text-base"
        >
          Continue with Google
        </Button>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
