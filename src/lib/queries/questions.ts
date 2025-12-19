import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";
import type { Question } from "@/types/question";

export async function getQuestionsByExam(examDocId: string): Promise<Question[]> {
  const ref = collection(db, "questions");
  const snapshot = await getDocs(
    query(ref, where("examId", "==", examDocId), orderBy("updatedAt")),
  );
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      text: (data.text as string) ?? "",
      options: Array.isArray(data.options) ? data.options.map(String) : [],
      answerIndex: Number(data.answerIndex ?? -1),
    } satisfies Question;
  });
}
