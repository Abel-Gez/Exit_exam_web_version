// src/app/app/offline/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { Lock, ArrowLeft } from "lucide-react";

export default function OfflinePage() {
  const router = useRouter();
  const { profile } = useAuthStore();

  if (profile?.premium) {
    router.replace("/app/home");
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Premium Feature
        </h1>
        <p className="text-gray-600 mb-8">
          This feature is only available for premium users. Upgrade your account
          to access offline mode, unlimited quizzes, and more.
        </p>

        <div className="space-y-4">
          <Button
            className="w-full"
            size="lg"
            onClick={() => router.push("/app/profile/subscription")}
          >
            Upgrade to Premium
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
