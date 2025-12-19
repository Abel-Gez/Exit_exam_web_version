// src/app/app/profile/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Mail,
  GraduationCap,
  Award,
  LogOut,
  Edit,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, setProfile, setFirebaseUser } = useAuthStore();

  if (!profile) {
    router.push("/login");
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      setProfile(null);
      setFirebaseUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col items-center text-center mb-8">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage
            src={profile.photoURL || ""}
            alt={profile.fullName || "User"}
          />
          <AvatarFallback className="text-2xl">
            {getInitials(profile.fullName)}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold">{profile.fullName || "User"}</h1>
        <p className="text-muted-foreground">{profile.email}</p>
        <Button variant="outline" size="sm" className="mt-2">
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{profile.email || "Not provided"}</p>
              </div>
            </div>

            {profile.university && (
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">University</p>
                  <p>{profile.university}</p>
                </div>
              </div>
            )}

            {profile.department && (
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-full">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p>{profile.department}</p>
                </div>
              </div>
            )}

            {profile.studentId && (
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-amber-100 rounded-full">
                  <Award className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Student ID</p>
                  <p>{profile.studentId}</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gray-100 rounded-full">
                <Calendar className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member since</p>
                <p>
                  {profile.premiumSince
                    ? new Date(profile.premiumSince).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Current Plan</p>
                  <h3 className="text-2xl font-bold">
                    {profile.premium ? "Premium" : "Free"}
                  </h3>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Award className="h-6 w-6" />
                </div>
              </div>
              {profile.premiumExpiresAt && (
                <p className="mt-2 text-sm opacity-90">
                  Expires on{" "}
                  {new Date(profile.premiumExpiresAt).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Plan Benefits</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {profile.premium ? "Unlimited" : "Limited"} quizzes
                </li>
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {profile.premium ? "Offline access" : "Online only"}
                </li>
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Detailed progress tracking
                </li>
              </ul>
            </div>

            <Button
              variant={profile.premium ? "outline" : "default"}
              className="w-full mt-4"
              onClick={() =>
                router.push(
                  profile.premium ? "/app/profile/subscription" : "/app/upgrade"
                )
              }
            >
              {profile.premium ? "Manage Subscription" : "Upgrade to Premium"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-8">
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
