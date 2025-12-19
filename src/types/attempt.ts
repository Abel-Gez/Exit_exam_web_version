// src/types/attempt.ts
export interface Attempt {
  id: string;
  examId: string;
  userId: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  startedAt: any; // Use firestore.Timestamp or Date based on your needs
  finishedAt: any; // Use firestore.Timestamp or Date based on your needs
}