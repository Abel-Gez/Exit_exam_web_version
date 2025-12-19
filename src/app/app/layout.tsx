"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { AppShell } from "@/components/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { firebaseUser, initializing } = useAuthStore();

  useEffect(() => {
    if (!initializing && !firebaseUser) {
      router.replace("/login");
    }
  }, [firebaseUser, initializing, router]);

  if (!firebaseUser) {
    if (initializing) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      );
    }
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
