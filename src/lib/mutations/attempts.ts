// src/lib/mutations/attempts.ts
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import type { Attempt } from "@/types/attempt";
import { useAuthStore } from "@/store/auth-store";

export async function saveAttempt(attempt: {
  examId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
}): Promise<Attempt> {
  const { profile } = useAuthStore.getState();
  if (!profile?.uid) {
    throw new Error("User not authenticated");
  }

  const attemptId = uuidv4();
  const now = serverTimestamp();
  
  const attemptData: Omit<Attempt, "id"> = {
    examId: attempt.examId,
    userId: profile.uid,
    score: attempt.score,
    correctCount: attempt.correctAnswers,
    wrongCount: attempt.totalQuestions - attempt.correctAnswers,
    totalQuestions: attempt.totalQuestions,
    startedAt: now,
    finishedAt: now,
  };

  const attemptRef = doc(db, "users", profile.uid, "attempts", attemptId);
  await setDoc(attemptRef, attemptData);

  return { id: attemptId, ...attemptData };
}