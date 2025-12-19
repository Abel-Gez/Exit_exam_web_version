// src/components/protected-route.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { profile, initializing } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!initializing) {
      if (!profile) {
        router.push("/login");
      }
      setIsLoading(false);
    }
  }, [profile, initializing, router]);

  if (isLoading || initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!profile) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
