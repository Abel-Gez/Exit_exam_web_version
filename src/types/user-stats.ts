export type PerExamStats = {
  attempts: number;
  averageScore: number;
  bestScore: number;
  sumScores: number;
};

export type UserStats = {
  userId: string;
  accuracy: number;
  totalCorrect: number;
  totalWrong: number;
  totalQuestions: number;
  totalExams: number;
  updatedAt: Date | null;
  perExam: Record<string, PerExamStats>;
};
