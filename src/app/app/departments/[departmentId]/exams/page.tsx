"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ClipboardList, Loader2 } from "lucide-react";

import { getDepartment } from "@/lib/queries/departments";
import { getExamTypesByDepartment } from "@/lib/queries/exam-types";
import { getExamsByExamType } from "@/lib/queries/exams";
import type { Department } from "@/lib/queries/departments";
import type { ExamType } from "@/types/exam-type";
import type { Exam } from "@/types/exam";

export default function DepartmentExamsPage() {
  const router = useRouter();
  const params = useParams<{ departmentId: string }>();
  const departmentId = params.departmentId;
  const [department, setDepartment] = useState<Department | null>(null);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [examsByType, setExamsByType] = useState<Record<string, Exam[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [dept, types] = await Promise.all([
          getDepartment(departmentId),
          getExamTypesByDepartment(departmentId),
        ]);
        if (!mounted) return;
        setDepartment(dept);
        setExamTypes(types);
        const examsRecord: Record<string, Exam[]> = {};
        for (const type of types) {
          examsRecord[type.id] = await getExamsByExamType(type.id);
        }
        if (!mounted) return;
        setExamsByType(examsRecord);
        setError(null);
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError("Failed to load exams. Please try again later.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [departmentId]);

  const exams = useMemo(() => {
    return examTypes.flatMap((type) =>
      (examsByType[type.id] ?? []).map((exam) => ({
        exam,
        type,
      })),
    );
  }, [examTypes, examsByType]);

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

  if (!department) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow">
        Department not found.
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          className="flex items-center gap-2 text-blue-600"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow">
          No exams available for this department yet.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button type="button" className="flex items-center gap-2 text-blue-600" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">{department.name}</h2>
        <p className="text-sm text-slate-500">Choose an exam to start practicing.</p>
      </div>
      <div className="space-y-4">
        {exams.map(({ exam, type }) => (
          <div key={exam.id} className="rounded-3xl bg-white p-5 shadow transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-blue-500">{type.name}</p>
                <h3 className="text-lg font-semibold text-slate-900">{exam.title}</h3>
                <p className="text-sm text-slate-500">
                  Questions: {exam.questionCount} • Time: {formatDuration(exam.timeLimitSec)}
                </p>
              </div>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                onClick={() => router.push(`/app/exams/${exam.id}/quiz`)}
              >
                Start <ClipboardList className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDuration(seconds: number) {
  if (!seconds) return "--";
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes === 0) {
    return `${seconds}s`;
  }
  if (remainder === 0) {
    return `${minutes}m`;
  }
  return `${minutes}m ${remainder}s`;
}
