import { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api";

export default function useInterviewSession(questions, sessionId, difficulty = 'medium') {
  const timeByDifficulty = { easy: 180, medium: 300, hard: 420 };
  const defaultTime = timeByDifficulty[difficulty] ?? 60;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [scores, setScores] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [skipped, setSkipped] = useState([]);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(defaultTime);

  const intervalRef = useRef(null);

  const q = questions?.[currentIndex] || null;

  // ---------------- NEXT ----------------
  const goNext = useCallback(() => {
    if (evaluating || finished) return;

    const isLast = currentIndex >= questions.length - 1;

    if (isLast) {
      setFinished(true);
      return;
    }

    setCurrentIndex((i) => i + 1);
    setAnswer("");
    setFeedback("");
    setSubmitted(false);
    setTimeLeft(defaultTime);
  }, [currentIndex, questions.length, evaluating, finished]);

  // ---------------- SKIP ----------------
  const handleSkip = useCallback(() => {
    if (evaluating || finished) return;

    setSkipped((prev) => [...prev, currentIndex]);
    goNext();
  }, [evaluating, finished, currentIndex, goNext]);

  // ---------------- TIMER ----------------
  useEffect(() => {
    if (!q || finished || evaluating || submitted) return;

    // clear old interval first (IMPORTANT)
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      // 🧠 prevent tab background bugs
      if (document.hidden) return;

      setTimeLeft((t) => {
        if (t <= 1) {
          handleSkip();
          return defaultTime;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [q, finished, evaluating, submitted, handleSkip]);

  // ---------------- SUBMIT ----------------
  const checkAnswer = useCallback(async () => {
    if (submitted || evaluating || !q) return;

    setEvaluating(true);

    try {
      const res = await api.post(
        "/evaluate",
        {
          question: q.question,
          answer,
          difficulty,
        },
        { timeout: 120000 }
      );

      const score = Number(res.data?.score) || 0;
      const explanation = res.data?.explanation || res.data?.feedback || "";
      const improvedAnswer = res.data?.improved_answer || "";
      const provisional = Boolean(res.data?.provisional);

      if (!explanation) {
        throw new Error("Empty evaluation response");
      }

      setFeedback(explanation);
      setSubmitted(true);
      setScores((prev) => [...prev, score]);
      setAnswers((prev) => {
        const updated = [...prev];
        updated[currentIndex] = {
          question: q.question,
          answer,
          score,
          explanation,
          improvedAnswer,
          provisional,
        };
        return updated;
      });
    } catch (err) {
      console.error("Evaluation failed:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Evaluation failed. Check that the API is running.";

      const isTimeout = /timeout/i.test(message);
      const isNetwork = /network error/i.test(message);
      setFeedback(
        isTimeout
          ? "AI evaluation timed out. Please submit again or skip this question."
          : isNetwork
            ? "Connection lost while the AI was scoring. Make sure the server is running and try again."
            : `Could not evaluate your answer (${message}). You can skip to the next question or try again.`
      );
      setSubmitted(false);
    } finally {
      setEvaluating(false);
    }
  }, [answer, currentIndex, q, submitted, evaluating]);

  // ---------------- RESET ----------------
  const resetInterview = useCallback(() => {
    setCurrentIndex(0);
    setAnswer("");
    setFeedback("");
    setSubmitted(false);
    setEvaluating(false);
    setScores([]);
    setAnswers([]);
    setSkipped([]);
    setFinished(false);
    setTimeLeft(defaultTime);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  return {
    q,
    currentIndex,
    answer,
    setAnswer,
    feedback,
    submitted,
    evaluating,
    timeLeft,
    finished,
    answers,
    skipped,
    scores,
    checkAnswer,
    goNext,
    handleSkip,
    resetInterview,
  };
}