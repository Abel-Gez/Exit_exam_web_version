// src/app/app/exams/[examId]/quiz/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getExamById } from "@/lib/queries/exams";
import { getQuestionsByExam } from "@/lib/queries/questions";
import { saveAttempt } from "@/lib/mutations/attempts";
import { updateUserStats } from "@/lib/mutations/user-stats";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const examData = await getExamById(params.examId as string);
        if (!examData) {
          setError("Exam not found");
          return;
        }
        setExam(examData);

        const questionsData = await getQuestionsByExam(params.examId as string);
        setQuestions(questionsData);
        setAnswers(new Array(questionsData.length).fill(null));
      } catch (err) {
        console.error("Error loading quiz data:", err);
        setError("Failed to load quiz data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.examId]);

  const handleOptionSelect = (optionIndex: number) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
    setSelectedOption(optionIndex);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(answers[currentQuestion + 1]);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[currentQuestion - 1]);
    }
  };

  const handleSubmit = async () => {
    if (submitted) return;

    // Calculate score
    let correctAnswers = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index].answerIndex) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);

    // Save attempt and update stats
    try {
      await saveAttempt({
        examId: params.examId as string,
        score: finalScore,
        correctAnswers,
        totalQuestions: questions.length,
      });
      await updateUserStats({
        examId: params.examId as string,
        score: finalScore,
        correctCount: correctAnswers,
        wrongCount: questions.length - correctAnswers,
        totalQuestions: questions.length,
      });
    } catch (err) {
      console.error("Error saving attempt:", err);
    }
  };

  if (loading) {
    return <div>Loading quiz...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!exam || !questions.length) {
    return <div>No questions available for this exam.</div>;
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{exam.title}</h1>
        <div className="mt-2 text-gray-600">
          Question {currentQuestion + 1} of {questions.length}
        </div>
      </div>

      {!submitted ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <p className="text-lg">{currentQ.text}</p>
          </div>

          <div className="space-y-3">
            {currentQ.options.map((option: string, index: number) => (
              <button
                key={index}
                className={`w-full text-left p-4 rounded-lg border ${
                  answers[currentQuestion] === index
                    ? "bg-blue-100 border-blue-500"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => handleOptionSelect(index)}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            {currentQuestion < questions.length - 1 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={handleSubmit}>Submit Quiz</Button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
          <p className="text-xl mb-6">
            Your score: <span className="font-bold">{score}%</span>
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => router.push("/app/home")}>
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCurrentQuestion(0);
                setSelectedOption(null);
                setAnswers(new Array(questions.length).fill(null));
                setSubmitted(false);
                setScore(0);
              }}
            >
              Retake Quiz
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
