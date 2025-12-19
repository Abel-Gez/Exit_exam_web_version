// src/components/providers/auth-provider.tsx
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { useAuthStore } from "@/store/auth-store";
import type { AppUser } from "@/types/user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setFirebaseUser, setProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const appUser: AppUser = {
              uid: user.uid,
              email: user.email || "",
              fullName: user.displayName || userData.fullName || "User",
              photoURL: user.photoURL || userData.photoURL || null,
              premium: userData.premium || false,
              premiumSince: userData.premiumSince?.toDate() || null,
              premiumExpiresAt: userData.premiumExpiresAt?.toDate() || null,
              department: userData.department || null,
              university: userData.university || null,
              year: userData.year || null,
              studentId: userData.studentId || null,
              phone: userData.phone || null,
              gender: userData.gender || null,
            };
            setProfile(appUser);
          } else {
            // Create user document if it doesn't exist
            const newUser: AppUser = {
              uid: user.uid,
              email: user.email || "",
              fullName: user.displayName || "User",
              photoURL: user.photoURL,
              premium: false,
              premiumSince: null,
              premiumExpiresAt: null,
              department: null,
              university: null,
              year: null,
              studentId: null,
              phone: null,
              gender: null,
            };
            await setDoc(userRef, newUser);
            setProfile(newUser);
          }
          setFirebaseUser(user);
        } catch (error) {
          console.error("Error loading user profile:", error);
          setProfile(null);
        }
      } else {
        setFirebaseUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [setFirebaseUser, setProfile, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}
