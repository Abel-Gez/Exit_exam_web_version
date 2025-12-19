// src/lib/auth.ts
"use client";

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type AuthError,
  type User,
} from "firebase/auth";
import {
  Timestamp,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";

export type AuthResult = { 
  success: true; 
  user?: User 
} | { 
  success: false; 
  message: string 
};

function parseError(error: unknown): string {
  const fallback = "Unexpected error. Please try again.";
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return fallback;
}

async function ensureUserDocument(uid: string, data: Partial<Record<string, unknown>> = {}) {
  const ref = doc(db, "users", uid);
  const snapshot = await getDoc(ref);
  const now = serverTimestamp();
  
  const defaults = {
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
    email: data.email || "",
    emailVerified: false,
    fullName: data.fullName || "",
    photoURL: data.photoURL || null,
    phone: "",
    department: "",
    university: "",
    year: "",
    studentId: "",
    provider: data.provider || "password",
    premium: false,
    premiumSince: null,
    premiumExpiresAt: null,
  };

  if (snapshot.exists()) {
    await updateDoc(ref, {
      ...defaults,
      ...data,
      updatedAt: now,
      lastLoginAt: now,
    });
  } else {
    await setDoc(ref, { ...defaults, ...data });
  }
}

async function ensureUserStatsDocument(uid: string) {
  const ref = doc(db, "userStats", uid);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) return;
  
  await setDoc(ref, {
    accuracy: 0,
    totalCorrect: 0,
    totalWrong: 0,
    totalQuestions: 0,
    totalExams: 0,
    updatedAt: Timestamp.now(),
    userId: uid,
    perExam: {},
  });
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await ensureUserDocument(credential.user.uid, { 
      email, 
      provider: credential.user.providerId 
    });
    return { success: true, user: credential.user };
  } catch (error) {
    return { success: false, message: parseError(error) };
  }
}

export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    const user = credential.user;
    
    await ensureUserDocument(user.uid, {
      email: user.email || "",
      emailVerified: user.emailVerified,
      fullName: user.displayName || "",
      photoURL: user.photoURL,
      provider: "google",
    });
    
    await ensureUserStatsDocument(user.uid);
    return { success: true, user };
  } catch (error) {
    return { success: false, message: parseError(error) };
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string,
): Promise<AuthResult> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (fullName) {
      await updateProfile(credential.user, { displayName: fullName });
    }
    
    await ensureUserDocument(credential.user.uid, {
      email,
      fullName,
      emailVerified: credential.user.emailVerified,
      provider: "password",
    });
    
    await ensureUserStatsDocument(credential.user.uid);
    return { success: true, user: credential.user };
  } catch (error) {
    return { success: false, message: parseError(error) };
  }
}

export async function signOut(): Promise<AuthResult> {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, message: parseError(error) };
  }
}

export async function sendPasswordResetEmailToUser(email: string): Promise<AuthResult> {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, message: parseError(error) };
  }
}

export function authErrorMessage(error: AuthError): string {
  return error.message;
}