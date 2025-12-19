"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  BookOpen,
  Bookmark,
  User,
  LogOut,
  Menu,
  X,
  FileQuestionMark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useState, useEffect, useRef } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, signOut } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: "Home", path: "/app/home", icon: Home },
    { name: "Exams", path: "/app/departments", icon: BookOpen },
    { name: "Notes", path: "/app/notes", icon: Bookmark },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header
        className={`sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200 ${
          isScrolled ? "shadow-sm" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <h1
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent cursor-pointer"
                onClick={() => router.push("/app/home")}
              >
                ExitExam
              </h1>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-6">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                      pathname === item.path
                        ? "text-blue-600 border-b-2 border-blue-500"
                        : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Desktop Profile/Auth */}
            <div className="hidden md:flex items-center space-x-4">
              {profile ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-gray-100"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center text-white font-medium">
                      {profile?.fullName?.charAt(0) ||
                        profile?.email?.charAt(0).toUpperCase() ||
                        "U"}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {profile?.fullName || "Profile"}
                    </span>
                  </Button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <Button
                          variant="ghost"
                          className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            router.push("/app/profile");
                            setIsProfileOpen(false);
                          }}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Your Profile
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          onClick={() => {
                            handleSignOut();
                            setIsProfileOpen(false);
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign out
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => router.push("/login")}
                  className="px-4 py-2 text-sm"
                >
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    router.push(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-base font-medium ${
                    pathname === item.path
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              {profile ? (
                <div className="px-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center text-white font-medium">
                      {profile?.fullName?.charAt(0) ||
                        profile?.email?.charAt(0).toUpperCase() ||
                        "U"}
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {profile?.fullName || "Profile"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        router.push("/app/profile");
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      Your Profile
                    </button>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-4">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      router.push("/login");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
