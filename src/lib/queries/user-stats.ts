import { Timestamp, doc, getDoc } from "firebase/firestore";

import { db } from "../firebase";
import type { PerExamStats, UserStats } from "@/types/user-stats";

export async function getUserStats(uid: string): Promise<UserStats | null> {
  const ref = doc(db, "userStats", uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    return null;
  }
  const data = snapshot.data();
  const perExam: Record<string, PerExamStats> = {};
  if (data.perExam && typeof data.perExam === "object") {
    Object.entries(data.perExam as Record<string, unknown>).forEach(([examId, value]) => {
      if (value && typeof value === "object") {
        const attemptData = value as Record<string, unknown>;
        perExam[examId] = {
          attempts: Number(attemptData.attempts ?? 0),
          averageScore: Number(attemptData.averageScore ?? 0),
          bestScore: Number(attemptData.bestScore ?? 0),
          sumScores: Number(attemptData.sumScores ?? 0),
        } satisfies PerExamStats;
      }
    });
  }
  return {
    userId: (data.userId as string) ?? uid,
    accuracy: Number(data.accuracy ?? 0),
    totalCorrect: Number(data.totalCorrect ?? 0),
    totalWrong: Number(data.totalWrong ?? 0),
    totalQuestions: Number(data.totalQuestions ?? 0),
    totalExams: Number(data.totalExams ?? 0),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
    perExam,
  } satisfies UserStats;
}
