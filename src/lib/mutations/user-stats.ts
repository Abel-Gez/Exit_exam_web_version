// src/lib/mutations/user-stats.ts
import { doc, getDoc, setDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function updateUserStats(examId: string, score: number) {
  const { profile } = useAuthStore.getState();
  if (!profile) throw new Error("User not authenticated");

  const statsRef = doc(db, "userStats", profile.uid);
  const statsDoc = await getDoc(statsRef);

  const currentStats = statsDoc.exists() ? statsDoc.data() : {
    totalCorrect: 0,
    totalWrong: 0,
    totalQuestions: 0,
    totalExams: 0,
    perExam: {},
  };

  const correctAnswers = Math.round((score / 100) * currentStats.totalQuestions || 10); // Estimate if not available
  const wrongAnswers = (currentStats.totalQuestions || 10) - correctAnswers;

  const updateData = {
    userId: profile.uid,
    totalCorrect: increment(correctAnswers),
    totalWrong: increment(wrongAnswers),
    totalQuestions: increment(currentStats.totalQuestions || 10),
    totalExams: increment(1),
    updatedAt: serverTimestamp(),
    [`perExam.${examId}.attempts`]: increment(1),
    [`perExam.${examId}.sumScores`]: increment(score),
    [`perExam.${examId}.bestScore`]: Math.max(
      currentStats.perExam?.[examId]?.bestScore || 0,
      score
    ),
  };

  // Calculate accuracy
  const newTotal = (currentStats.totalCorrect || 0) + correctAnswers + (currentStats.totalWrong || 0) + wrongAnswers;
  if (newTotal > 0) {
    updateData.accuracy = Math.round(
      ((currentStats.totalCorrect || 0) + correctAnswers) / newTotal * 100
    );
  }

  await setDoc(statsRef, updateData, { merge: true });
}