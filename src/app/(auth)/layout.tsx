import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exit Exam Prep | Auth",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
