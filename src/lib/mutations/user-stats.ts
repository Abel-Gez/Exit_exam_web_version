// src/lib/mutations/user-stats.ts
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuthStore } from "@/store/auth-store";

type PerExamStats = {
  attempts: number;
  averageScore: number;
  bestScore: number;
  sumScores: number;
};

type UserStatsDoc = {
  userId: string;
  accuracy?: number; // fraction: 0.35
  totalCorrect: number;
  totalWrong: number;
  totalQuestions: number;
  totalExams: number;
  perExam?: Record<string, PerExamStats>;
  updatedAt?: any;
};

export async function updateUserStats(input: {
  examId: string; // slug like "networking_basics"
  score: number; // percent 0-100
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
}) {
  const { profile } = useAuthStore.getState();
  if (!profile?.uid) throw new Error("User not authenticated");

  const uid = profile.uid;
  const statsRef = doc(db, "userStats", uid);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(statsRef);

    const current: UserStatsDoc = snap.exists()
      ? (snap.data() as UserStatsDoc)
      : {
          userId: uid,
          accuracy: 0,
          totalCorrect: 0,
          totalWrong: 0,
          totalQuestions: 0,
          totalExams: 0,
          perExam: {},
        };

    const perExam = current.perExam ?? {};
    const prevExam: PerExamStats = perExam[input.examId] ?? {
      attempts: 0,
      averageScore: 0,
      bestScore: 0,
      sumScores: 0,
    };

    const nextTotalCorrect = (current.totalCorrect ?? 0) + input.correctCount;
    const nextTotalWrong = (current.totalWrong ?? 0) + input.wrongCount;
    const nextTotalQuestions =
      (current.totalQuestions ?? 0) + input.totalQuestions;
    const nextTotalExams = (current.totalExams ?? 0) + 1;

    // Accuracy stored as fraction (0..1)
    const nextAccuracy =
      nextTotalQuestions > 0 ? nextTotalCorrect / nextTotalQuestions : 0;

    const nextExamAttempts = prevExam.attempts + 1;
    const nextExamSumScores = prevExam.sumScores + input.score;
    const nextExamBestScore = Math.max(prevExam.bestScore, input.score);
    const nextExamAverageScore =
      nextExamAttempts > 0 ? nextExamSumScores / nextExamAttempts : 0;

    const updateData: UserStatsDoc = {
      userId: uid,
      accuracy: nextAccuracy,
      totalCorrect: nextTotalCorrect,
      totalWrong: nextTotalWrong,
      totalQuestions: nextTotalQuestions,
      totalExams: nextTotalExams,
      perExam: {
        ...perExam,
        [input.examId]: {
          attempts: nextExamAttempts,
          sumScores: nextExamSumScores,
          bestScore: nextExamBestScore,
          averageScore: nextExamAverageScore,
        },
      },
      updatedAt: serverTimestamp(),
    };

    tx.set(statsRef, updateData, { merge: true });
  });
}
