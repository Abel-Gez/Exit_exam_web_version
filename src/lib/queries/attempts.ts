import {
  Timestamp,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../firebase";
import type { Attempt } from "@/types/attempt";

export async function getRecentAttempts(uid: string, take = 10): Promise<Attempt[]> {
  const attemptsRef = collection(db, "users", uid, "attempts");
  const snapshot = await getDocs(
    query(attemptsRef, orderBy("finishedAt", "desc"), limit(take)),
  );

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      correctCount: Number(data.correctCount ?? 0),
      wrongCount: Number(data.wrongCount ?? 0),
      totalQuestions: Number(data.totalQuestions ?? 0),
      score: Number(data.score ?? 0),
      examId: (data.examId as string) ?? "",
      userId: (data.userId as string) ?? uid,
      startedAt: data.startedAt instanceof Timestamp ? data.startedAt.toDate() : null,
      finishedAt: data.finishedAt instanceof Timestamp ? data.finishedAt.toDate() : null,
    } satisfies Attempt;
  });
}
