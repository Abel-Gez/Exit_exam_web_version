// src/app/app/home/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

import { getRecentAttempts } from "@/lib/queries/attempts";
import { getUserStats } from "@/lib/queries/user-stats";
import { getExamsBySlugs } from "@/lib/queries/exams";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  BookOpen,
  Clock,
  Award,
  BarChart2,
  ArrowRight,
  Crown,
  Sparkles,
} from "lucide-react";

// Optional animations (install: npm i framer-motion)
import { motion } from "framer-motion";

type FirestoreLikeTimestamp = { toDate?: () => Date };

type Attempt = {
  id: string;
  examId: string; // slug like "networking_basics"
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  score?: number; // seems like percent in your DB (e.g., 50)
  startedAt: Date | string | number | FirestoreLikeTimestamp;
  finishedAt: Date | string | number | FirestoreLikeTimestamp;
};

type UserStats = {
  accuracy?: number; // stored like 0.35 (fraction)
  totalExams?: number;
  totalQuestions?: number;
  totalCorrect?: number;
  totalWrong?: number;
  perExam?: Record<
    string,
    {
      attempts: number;
      averageScore: number;
      bestScore: number;
      sumScores: number;
    }
  >;
};

type Exam = {
  examId: string; // slug (IMPORTANT)
  title: string;
  questionCount: number;
  timeLimitSec: number;
  examTypeId: string;
};

function toJsDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === "function") return value.toDate(); // Firestore Timestamp [web:213]
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatHhMm(totalSec: number) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  return `${h}h ${m}m`;
}

function attemptDurationSec(a: Attempt) {
  const s = toJsDate(a.startedAt);
  const f = toJsDate(a.finishedAt);
  if (!s || !f) return 0;
  return Math.max(0, Math.floor((f.getTime() - s.getTime()) / 1000));
}

function attemptPercent(a: Attempt) {
  if (typeof a.score === "number") return clamp(Math.round(a.score), 0, 100);
  if (a.totalQuestions > 0) {
    return clamp(Math.round((a.correctCount / a.totalQuestions) * 100), 0, 100);
  }
  return 0;
}

export default function HomePage() {
  const router = useRouter();
  const { profile } = useAuthStore();

  const [stats, setStats] = useState<UserStats | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [examsBySlug, setExamsBySlug] = useState<Record<string, Exam>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch more than 5 so "time spent this week" is meaningful.
        const [userStats, recentAttempts] = await Promise.all([
          getUserStats(profile.uid),
          getRecentAttempts(profile.uid, 30),
        ]);

        setStats(userStats ?? null);
        setAttempts(recentAttempts ?? []);

        const examSlugs = Array.from(
          new Set(
            (recentAttempts ?? []).map((a: any) => a.examId).filter(Boolean)
          )
        );

        if (examSlugs.length > 0) {
          const examDocs: Exam[] = await getExamsBySlugs(examSlugs);

          // IMPORTANT: key by exam.examId (slug) so attempts join works
          const map: Record<string, Exam> = {};
          for (const e of examDocs ?? []) {
            const key = (e as any).examId ?? (e as any).id;
            if (key) map[key] = e;
          }
          setExamsBySlug(map);
        } else {
          setExamsBySlug({});
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [profile, router]);

  const recentAttempts = useMemo(() => attempts.slice(0, 5), [attempts]);

  const avgAccuracyPercent = useMemo(() => {
    if (typeof stats?.accuracy !== "number") return null;
    // Stored as fraction (0.35 => 35%)
    return clamp(Math.round(stats.accuracy * 100), 0, 100);
  }, [stats]);

  const weekTimeSec = useMemo(() => {
    const now = Date.now();
    const weekMs = 7 * 24 * 3600 * 1000;
    return attempts
      .filter((a) => {
        const f = toJsDate(a.finishedAt);
        return f ? now - f.getTime() <= weekMs : false;
      })
      .reduce((sum, a) => sum + attemptDurationSec(a), 0);
  }, [attempts]);

  const achievements = useMemo(() => {
    // No dedicated achievements collection yet → derive from stats.
    const totalBadges = 10;

    const totalExams = stats?.totalExams ?? 0;
    const totalQuestions = stats?.totalQuestions ?? 0;
    const acc = stats?.accuracy ?? 0;

    const unlocked =
      (totalExams >= 1 ? 1 : 0) +
      (totalExams >= 5 ? 1 : 0) +
      (totalExams >= 10 ? 1 : 0) +
      (totalQuestions >= 100 ? 1 : 0) +
      (totalQuestions >= 500 ? 1 : 0) +
      (acc >= 0.5 ? 1 : 0) +
      (acc >= 0.7 ? 1 : 0) +
      (acc >= 0.85 ? 1 : 0);

    return { unlocked: clamp(unlocked, 0, totalBadges), totalBadges };
  }, [stats]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const isPremium = Boolean((profile as any)?.premium);

  // Motion variants (optional)
  const container = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* HERO */}
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div
            variants={item}
            className="relative overflow-hidden rounded-3xl border bg-white/70 backdrop-blur shadow-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-500/5 to-cyan-400/10" />
            <div className="relative p-6 sm:p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    Welcome back, {profile?.fullName || "Student"}!
                  </h1>
                  {isPremium && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                      <Crown className="h-4 w-4" />
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-slate-600 max-w-2xl">
                  Keep practicing daily. Review mistakes, track progress, and
                  pass your exit exam with confidence.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="rounded-xl bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push("/app/departments")}
                >
                  Start Practice <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  className="rounded-xl bg-white/60 hover:bg-white"
                  onClick={() => router.push("/app/notes")}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Review Notes
                </Button>
              </div>
            </div>
          </motion.div>

          {/* STATS GRID */}
          <motion.div
            variants={item}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
          >
            <StatCard
              title="Total Exams"
              value={`${stats?.totalExams ?? 0}`}
              subtitle="Completed so far"
              icon={<BookOpen className="h-5 w-5 text-blue-600" />}
              accent="from-blue-600/15 to-cyan-400/10"
            />

            <StatCard
              title="Average Score"
              value={
                avgAccuracyPercent === null ? "N/A" : `${avgAccuracyPercent}%`
              }
              subtitle="Overall accuracy"
              icon={<BarChart2 className="h-5 w-5 text-indigo-600" />}
              accent="from-indigo-600/15 to-fuchsia-400/10"
            />

            <StatCard
              title="Time Spent"
              value={formatHhMm(weekTimeSec)}
              subtitle="This week"
              icon={<Clock className="h-5 w-5 text-emerald-600" />}
              accent="from-emerald-600/15 to-lime-400/10"
            />

            <StatCard
              title="Achievements"
              value={`${achievements.unlocked}/${achievements.totalBadges}`}
              subtitle="Unlocked milestones"
              icon={<Award className="h-5 w-5 text-amber-600" />}
              accent="from-amber-600/15 to-orange-400/10"
            />
          </motion.div>
        </motion.div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="rounded-2xl border bg-white/70 backdrop-blur shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentAttempts.length > 0 ? (
                <div className="space-y-3">
                  {recentAttempts.map((a) => {
                    const examTitle =
                      examsBySlug[a.examId]?.title ??
                      a.examId ??
                      "Unknown Exam";
                    const finished = toJsDate(a.finishedAt);
                    const percent = attemptPercent(a);

                    return (
                      <div
                        key={a.id}
                        className="group flex items-center justify-between rounded-xl border bg-white/60 px-4 py-3 transition-all hover:bg-white hover:shadow-md"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {examTitle}
                          </p>
                          <p className="text-sm text-slate-500">
                            {finished ? finished.toLocaleDateString() : "—"}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-lg text-slate-900">
                            {percent}%
                          </p>
                          <p className="text-sm text-slate-500">
                            {a.correctCount}/{a.totalQuestions} correct
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-500">No recent activity yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="rounded-2xl border bg-white/70 backdrop-blur shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-between rounded-xl bg-white/60 hover:bg-white"
                onClick={() => router.push("/app/departments")}
              >
                <span className="inline-flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Start New Quiz
                </span>
                <ArrowRight className="h-4 w-4 text-slate-500" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between rounded-xl bg-white/60 hover:bg-white"
                onClick={() => router.push("/app/notes")}
              >
                <span className="inline-flex items-center">
                  <Sparkles className="mr-2 h-4 w-4" />
                  View Study Notes
                </span>
                <ArrowRight className="h-4 w-4 text-slate-500" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between rounded-xl bg-white/60 hover:bg-white"
                onClick={() => router.push("/app/profile")}
              >
                <span className="inline-flex items-center">
                  <Award className="mr-2 h-4 w-4" />
                  My Profile
                </span>
                <ArrowRight className="h-4 w-4 text-slate-500" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  accent,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <Card className="rounded-2xl border bg-white/70 backdrop-blur shadow-sm transition-all hover:shadow-xl hover:-translate-y-0.5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
        <div className={`rounded-xl p-2 bg-gradient-to-br ${accent}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </div>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
