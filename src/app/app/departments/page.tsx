"use client";

import { GraduationCap, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { type Department, getDepartments } from "@/lib/queries/departments";

export default function DepartmentsPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getDepartments()
      .then((items) => {
        if (mounted) {
          setDepartments(items);
          setError(null);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.error(err);
          setError("Failed to load departments. Please try again later.");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl bg-red-50 p-6 text-center text-red-600">
        <div className="mb-2 flex justify-center">
          <AlertCircle className="h-6 w-6" />
        </div>
        <p>{error}</p>
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow">
        No departments available yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {departments.map((department) => (
        <button
          key={department.id}
          type="button"
          className="flex w-full items-center justify-between gap-4 rounded-3xl bg-white px-5 py-4 text-left shadow transition hover:-translate-y-0.5 hover:shadow-lg"
          onClick={() => router.push(`/app/departments/${department.id}/exams`)}
        >
          <span className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <GraduationCap className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-base font-semibold text-slate-900">
                {department.name}
              </span>
              <span className="block text-sm text-slate-500">Tap to view exams</span>
            </span>
          </span>
          <span className="text-blue-500">›</span>
        </button>
      ))}
    </div>
  );
}
