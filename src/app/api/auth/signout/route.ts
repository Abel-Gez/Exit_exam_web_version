// src/app/api/auth/signout/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export async function POST() {
  try {
    await signOut(auth);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error signing out:", error);
    return NextResponse.json(
      { error: "Failed to sign out" },
      { status: 500 }
    );
  }
}