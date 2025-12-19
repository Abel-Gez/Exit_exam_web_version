// src/types/user.ts
export interface AppUser {
  uid: string;
  email: string | null;
  fullName: string;
  photoURL: string | null;
  premium: boolean;
  premiumSince: Date | null;
  premiumExpiresAt: Date | null;
  department: string | null;
  university: string | null;
  year: string | null;
  studentId: string | null;
  phone: string | null;
  gender: string | null;
}