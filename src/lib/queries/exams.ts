import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";
import type { Exam } from "@/types/exam";
import { getExamTypesByDepartment } from "./exam-types";

export async function getExamsByExamType(examTypeId: string): Promise<Exam[]> {
  const ref = collection(db, "exams");
  const snapshot = await getDocs(
    query(ref, where("examTypeId", "==", examTypeId), orderBy("title")),
  );
  return snapshot.docs.map((doc) => toExam(doc.id, doc.data()));
}

export async function getExamById(examDocId: string): Promise<Exam | null> {
  const ref = doc(db, "exams", examDocId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return toExam(snapshot.id, snapshot.data());
}

export async function getExamBySlug(examSlug: string): Promise<Exam | null> {
  const ref = collection(db, "exams");
  const snapshot = await getDocs(
    query(ref, where("examId", "==", examSlug), limit(1)),
  );
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return toExam(docSnap.id, docSnap.data());
}

export async function getExamsBySlugs(slugs: string[]): Promise<Exam[]> {
  if (slugs.length === 0) return [];
  const chunks: string[][] = [];
  for (let i = 0; i < slugs.length; i += 10) {
    chunks.push(slugs.slice(i, i + 10));
  }
  const results: Exam[] = [];
  for (const chunk of chunks) {
    const snapshot = await getDocs(
      query(collection(db, "exams"), where("examId", "in", chunk)),
    );
    snapshot.forEach((doc) => {
      results.push(toExam(doc.id, doc.data()));
    });
  }
  return results;
}

export type ExamWithType = Exam & { examTypeName: string };

export async function getExamsByDepartment(departmentId: string): Promise<ExamWithType[]> {
  const examTypes = await getExamTypesByDepartment(departmentId);
  if (examTypes.length === 0) {
    return [];
  }
  const exams = await Promise.all(
    examTypes.map(async (type) => {
      const examsForType = await getExamsByExamType(type.id);
      return examsForType.map((exam) => ({ ...exam, examTypeName: type.name }));
    }),
  );
  return exams.flat().sort((a, b) => a.title.localeCompare(b.title));
}

function toExam(id: string, data: Record<string, unknown>): Exam {
  return {
    id,
    examId: (data.examId as string) ?? id,
    examTypeId: (data.examTypeId as string) ?? "",
    title: (data.title as string) ?? "Exam",
    questionCount: Number(data.questionCount ?? 0),
    timeLimitSec: Number(data.timeLimitSec ?? 0),
  } satisfies Exam;
}
