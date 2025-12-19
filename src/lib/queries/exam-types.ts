import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

import { db } from "../firebase";
import type { ExamType } from "@/types/exam-type";

export async function getExamTypesByDepartment(departmentId: string): Promise<ExamType[]> {
  const ref = collection(db, "examTypes");
  const snapshot = await getDocs(
    query(ref, where("departmentId", "==", departmentId), orderBy("name")),
  );
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      departmentId,
      name: (data.name as string) ?? "Exam type",
      description: data.description as string | undefined,
    } satisfies ExamType;
  });
}
