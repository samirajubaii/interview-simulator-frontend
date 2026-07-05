import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";

import InterviewCard from "../components/InterviewCard";
import useInterviewSession from "../hooks/useInterviewSession";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useBreakpoint } from "../hooks/useBreakpoint";

export default function Interview() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [questions, setQuestions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [loadingDots, setLoadingDots] = useState(0);
  const { isMobile } = useBreakpoint();

  const role = searchParams.get("role");
  const difficulty = searchParams.get("difficulty");
  const isAI = searchParams.get("ai") === "true";
  const sessionTs = searchParams.get("t") ?? "0";

  const sessionId = useRef(crypto.randomUUID()).current;
  const interview = useInterviewSession(questions, sessionId, difficulty);

  const resetInterviewRef = useRef(interview.resetInterview);
  resetInterviewRef.current = interview.resetInterview;
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    if (!loadingQuestions) return;
    const interval = setInterval(() => {
      setLoadingDots((d) => (d + 1) % 4);
    }, 400);
    return () => clearInterval(interval);
  }, [loadingQuestions]);

  useEffect(() => {
    if (!role || !difficulty) return;
    let cancelled = false;

    const load = async () => {
      setLoadingQuestions(true);
      setLoadError(null);
      try {
        let fetchedQuestions = [];
        if (isAI) {
          const res = await api.post("/questions/generate", { role, difficulty });
          const raw = res.data?.questions ?? [];
          fetchedQuestions = raw.map((text, i) => ({ id: i + 1, question: text, difficulty }));
        } else {
          const res = await api.get("/questions", { params: { category_id: role, difficulty } });
          fetchedQuestions = Array.isArray(res.data) ? res.data : [];
        }
        if (cancelled) return;
        setQuestions(fetchedQuestions);
        setSelectedRole(role);
        setSelectedDifficulty(difficulty);
        resetInterviewRef.current();
      } catch (err) {
        if (cancelled) return;
        setLoadError("Could not load questions. Please try again.");
        setQuestions([]);
      } finally {
        if (!cancelled) setLoadingQuestions(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [role, difficulty, isAI, sessionTs]);

  useEffect(() => {
    if (!interview.finished) return;
    const answered = interview.answers.filter((a) => a?.question);
    const answeredScores = interview.scores;
    const skippedCount = interview.skipped?.length ?? 0;
    const totalScore = questions.length > 0
      ? Math.round(
          answeredScores.reduce((a, b) => a + b, 0) /
          (answeredScores.length + skippedCount)
        )
      : 0;
    navigate("/review", {
      replace: true,
      state: {
        answers: answered,
        skipped: interview.skipped,
        totalScore,
        totalQuestions: questions.length,
        sessionId,
        categoryId: role,
        difficulty,
      },
    });
  }, [interview.finished, interview.answers, interview.skipped, interview.scores, navigate, role, difficulty, questions.length, sessionId]);

  const difficultyColor = {
    easy: "#22c55e",
    medium: "#f59e0b",
    hard: "#ef4444",
  }[difficulty] ?? "#6366f1";

  const difficultyLabel = {
    easy: "Junior",
    medium: "Mid-level",
    hard: "Senior",
  }[difficulty] ?? difficulty;

  const progress = questions.length > 0
    ? ((interview.currentIndex) / questions.length) * 100
    : 0;

  // ── shared mobile-boosted card style ────────────────────────────────────
  const mobileCard = isMobile ? {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
  } : {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
  };

  // LOADING
  if (authLoading || loadingQuestions) {
    return (
      <div style={s.page}>
        <div style={{
          ...s.ambientTop,
          background: isMobile
            ? "radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 70%)"
            : s.ambientTop.background,
        }} />
        <div style={{
          ...s.grid,
          backgroundImage: isMobile
            ? "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)"
            : s.grid.backgroundImage,
        }} />
        <motion.div style={s.loadingWrap} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{
            ...s.loadingCard,
            ...mobileCard,
            padding: isMobile ? "32px 20px" : "48px 40px",
          }}>
            <div style={s.loadingIcon}>
              <motion.div
                style={s.loadingSpinner}
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <h2 style={s.loadingTitle}>
              Preparing your interview{".".repeat(loadingDots)}
            </h2>
            <p style={s.loadingDesc}>
              Generating {role} questions at{" "}
              <span style={{ color: difficultyColor }}>{difficultyLabel}</span> level
            </p>
            <div style={s.loadingSteps}>
              {["Analyzing role requirements", "Generating tailored questions", "Calibrating difficulty"].map((step, i) => (
                <motion.div
                  key={step}
                  style={{ ...s.loadingStep, color: isMobile ? "#94a3b8" : "#475569" }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.3 + 0.5 }}
                >
                  <motion.span
                    style={s.loadingStepDot}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                  />
                  {step}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // NO ROLE SELECTED
  if (!role || !difficulty) {
    return (
      <div style={s.page}>
        <div style={s.ambientTop} />
        <div style={s.grid} />
        <div style={s.centerWrap}>
          <div style={{ ...s.emptyCard, ...mobileCard, padding: isMobile ? "32px 20px" : "48px 40px" }}>
            <span style={s.emptyIcon}>◎</span>
            <h1 style={s.emptyTitle}>No interview configured</h1>
            <p style={s.emptyDesc}>Go back to the home page and choose a role and difficulty level to begin.</p>
            <button style={s.emptyBtn} onClick={() => navigate("/")}>← Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  // ERROR
  if (loadError) {
    return (
      <div style={s.page}>
        <div style={s.ambientTop} />
        <div style={s.grid} />
        <div style={s.centerWrap}>
          <div style={{ ...s.emptyCard, ...mobileCard, padding: isMobile ? "32px 20px" : "48px 40px" }}>
            <span style={{ ...s.emptyIcon, color: "#ef4444" }}>⚠</span>
            <h1 style={s.emptyTitle}>Something went wrong</h1>
            <p style={{ ...s.emptyDesc, color: "#ef4444" }}>{loadError}</p>
            <button style={s.emptyBtn} onClick={() => navigate("/")}>← Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  // NO QUESTIONS
  if (questions.length === 0 && selectedRole) {
    return (
      <div style={s.page}>
        <div style={s.ambientTop} />
        <div style={s.grid} />
        <div style={s.centerWrap}>
          <div style={{ ...s.emptyCard, ...mobileCard, padding: isMobile ? "32px 20px" : "48px 40px" }}>
            <span style={s.emptyIcon}>◌</span>
            <h1 style={s.emptyTitle}>No questions found</h1>
            <p style={s.emptyDesc}>Try a different role or difficulty level.</p>
            <button style={s.emptyBtn} onClick={() => navigate("/")}>← Change Settings</button>
          </div>
        </div>
      </div>
    );
  }

  // FINISHED
  if (interview.finished) {
    return (
      <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={s.ambientTop} />
        <p style={{ color: "#475569" }}>Preparing your review...</p>
      </div>
    );
  }

  // NO QUESTION YET
  if (!interview.q) {
    return (
      <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={s.ambientTop} />
        <p style={{ color: "#475569" }}>Loading questions...</p>
      </div>
    );
  }

  // MAIN INTERVIEW
  return (
    <div style={s.page}>
      {/* Stronger ambient glow on mobile */}
      <div style={{
        ...s.ambientTop,
        background: isMobile
          ? "radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 70%)"
          : s.ambientTop.background,
      }} />
      {/* Stronger grid on mobile */}
      <div style={{
        ...s.grid,
        backgroundImage: isMobile
          ? "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)"
          : s.grid.backgroundImage,
      }} />

      {/* TOPBAR */}
      <div style={{
        ...s.topbar,
        borderBottom: isMobile
          ? "1px solid rgba(255,255,255,0.12)"
          : "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{
          ...s.topbarInner,
          gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr auto 1fr",
          padding: isMobile ? "0 12px" : "0 24px",
        }}>
          {/* LEFT */}
          <div style={s.topbarLeft}>
            <button style={{
              ...s.backBtn,
              border: isMobile
                ? "1px solid rgba(255,255,255,0.14)"
                : "1px solid rgba(255,255,255,0.08)",
              color: isMobile ? "#94a3b8" : "#64748b",
            }} onClick={() => setShowExitModal(true)}>
              ← Exit
            </button>
            <div style={s.topbarDivider} />
            <div style={s.sessionInfo}>
              <span style={s.sessionRole}>{role}</span>
              {!isMobile && (
                <span style={{ ...s.sessionDiff, color: difficultyColor }}>
                  {difficultyLabel}
                </span>
              )}
            </div>
          </div>

          {/* CENTER — desktop only */}
          {!isMobile && (
            <div style={s.topbarCenter}>
              <div style={s.progressWrap}>
                <div style={s.progressBar}>
                  <motion.div
                    style={s.progressFill}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <span style={s.progressLabel}>
                  {interview.currentIndex + 1} / {questions.length}
                </span>
              </div>
            </div>
          )}

          {/* RIGHT */}
          <div style={s.topbarRight}>
            {!isMobile && (
              <span style={s.topbarUser}>{user?.name}</span>
            )}
            <button style={{
              ...s.topbarLogout,
              border: isMobile
                ? "1px solid rgba(255,255,255,0.10)"
                : "1px solid rgba(255,255,255,0.06)",
              color: isMobile ? "#94a3b8" : "#475569",
            }} onClick={logout}>Logout</button>
          </div>
        </div>
      </div>

      {/* MOBILE PROGRESS BAR — stronger than original */}
      {isMobile && (
        <div style={{
          background: "rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          position: "sticky",
          top: "56px",
          zIndex: 99,
        }}>
          <div style={{
            flex: 1,
            height: "4px",
            background: "rgba(255,255,255,0.10)",
            borderRadius: "2px",
            overflow: "hidden",
          }}>
            <motion.div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #6366f1, #818cf8)",
                borderRadius: "2px",
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span style={{
            fontSize: "11px",
            color: "#94a3b8",
            fontWeight: "600",
            whiteSpace: "nowrap",
          }}>
            {interview.currentIndex + 1} / {questions.length}
          </span>
          {/* Difficulty badge — visible on mobile since topbar has no room */}
          <span style={{
            fontSize: "10px",
            fontWeight: "700",
            color: difficultyColor,
            background: `${difficultyColor}20`,
            border: `1px solid ${difficultyColor}50`,
            borderRadius: "4px",
            padding: "2px 7px",
          }}>
            {difficultyLabel}
          </span>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={{
        ...s.main,
        padding: isMobile ? "20px 14px 40px" : "48px 24px",
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={interview.currentIndex}
            style={s.cardWrap}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* QUESTION HEADER */}
            <div style={s.questionHeader}>
              <span style={s.questionNum}>Question {interview.currentIndex + 1}</span>
              {interview.timeLeft !== undefined && (
                <span style={{
                  ...s.timer,
                  color: interview.timeLeft < 30 ? "#ef4444" : isMobile ? "#64748b" : "#475569",
                }}>
                  {Math.floor(interview.timeLeft / 60)}:{String(interview.timeLeft % 60).padStart(2, "0")}
                </span>
              )}
            </div>

            <InterviewCard
              q={interview.q}
              answer={interview.answer}
              setAnswer={interview.setAnswer}
              checkAnswer={interview.checkAnswer}
              handleSkip={interview.handleSkip}
              goNext={interview.goNext}
              feedback={interview.feedback}
              submitted={interview.submitted}
              evaluating={interview.evaluating}
              timeLeft={interview.timeLeft}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* EXIT MODAL */}
      {showExitModal && (
        <motion.div
          style={s.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            style={{
              ...s.modalCard,
              width: isMobile ? "calc(100vw - 48px)" : 340,
              border: isMobile
                ? "1px solid rgba(255,255,255,0.16)"
                : "1px solid rgba(255,255,255,0.1)",
            }}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={s.modalIconWrap}>⚠</div>
            <h2 style={s.modalTitle}>Exit interview?</h2>
            <p style={s.modalDesc}>
              You're on question{" "}
              <span style={{ color: "#f1f5f9", fontWeight: 600 }}>
                {interview.currentIndex + 1} of {questions.length}
              </span>
              . Your progress won't be saved.
            </p>
            <div style={s.modalActions}>
              <button style={s.modalExitBtn} onClick={() => navigate("/")}>
                Yes, exit interview
              </button>
              <button style={s.modalCancelBtn} onClick={() => setShowExitModal(false)}>
                Continue interview
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#080c14",
    color: "#e2e8f0",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: "relative",
    overflowX: "hidden",
  },
  ambientTop: {
    position: "fixed",
    top: "-200px",
    right: "-100px",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  grid: {
    position: "fixed",
    inset: 0,
    backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
    backgroundSize: "80px 80px",
    pointerEvents: "none",
    zIndex: 0,
  },
  topbar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(8,12,20,0.9)",
    backdropFilter: "blur(16px)",
  },
  topbarInner: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "0 24px",
    height: "56px",
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: "16px",
  },
  topbarLeft: { display: "flex", alignItems: "center", gap: "12px" },
  backBtn: {
    background: "transparent",
    padding: "5px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
    minHeight: "44px",
    whiteSpace: "nowrap",
  },
  topbarDivider: { width: "1px", height: "20px", background: "rgba(255,255,255,0.08)" },
  sessionInfo: { display: "flex", alignItems: "center", gap: "8px" },
  sessionRole: { fontSize: "13px", fontWeight: "700", color: "#f1f5f9" },
  sessionDiff: { fontSize: "11px", fontWeight: "600", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "4px" },
  topbarCenter: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" },
  progressWrap: { display: "flex", alignItems: "center", gap: "10px", width: "240px" },
  progressBar: { flex: 1, height: "3px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #6366f1, #818cf8)", borderRadius: "2px" },
  progressLabel: { fontSize: "12px", color: "#475569", fontWeight: "600", whiteSpace: "nowrap" },
  topbarRight: { display: "flex", alignItems: "center", gap: "12px", justifyContent: "flex-end" },
  topbarUser: { fontSize: "13px", color: "#475569" },
  topbarLogout: {
    background: "transparent",
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
    minHeight: "44px",
  },
  main: { maxWidth: "800px", margin: "0 auto", padding: "48px 24px", position: "relative", zIndex: 1 },
  cardWrap: { display: "flex", flexDirection: "column", gap: "16px" },
  questionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" },
  questionNum: { fontSize: "12px", fontWeight: "600", color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.5px" },
  timer: { fontSize: "13px", fontWeight: "600", fontVariantNumeric: "tabular-nums" },
  loadingWrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", zIndex: 1 },
  loadingCard: { borderRadius: "20px", padding: "48px 40px", textAlign: "center", maxWidth: "400px", width: "100%", boxSizing: "border-box" },
  loadingIcon: { display: "flex", justifyContent: "center", marginBottom: "24px" },
  loadingSpinner: { width: "36px", height: "36px", border: "2px solid rgba(99,102,241,0.2)", borderTop: "2px solid #6366f1", borderRadius: "50%" },
  loadingTitle: { fontSize: "20px", fontWeight: "700", color: "#f1f5f9", margin: "0 0 8px", letterSpacing: "-0.3px" },
  loadingDesc: { fontSize: "14px", color: "#475569", margin: "0 0 32px" },
  loadingSteps: { display: "flex", flexDirection: "column", gap: "10px", textAlign: "left" },
  loadingStep: { display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#475569" },
  loadingStepDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#6366f1", flexShrink: 0, display: "inline-block" },
  centerWrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", zIndex: 1 },
  emptyCard: { borderRadius: "20px", padding: "48px 40px", textAlign: "center", maxWidth: "400px", width: "100%", boxSizing: "border-box" },
  emptyIcon: { fontSize: "32px", color: "#6366f1", display: "block", marginBottom: "20px" },
  emptyTitle: { fontSize: "22px", fontWeight: "700", color: "#f1f5f9", margin: "0 0 10px" },
  emptyDesc: { fontSize: "14px", color: "#475569", margin: "0 0 28px", lineHeight: "1.6" },
  emptyBtn: { background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", padding: "10px 20px", borderRadius: "8px", color: "#818cf8", fontSize: "14px", cursor: "pointer", minHeight: "44px" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "24px", boxSizing: "border-box" },
  modalCard: { background: "rgba(15,20,35,0.95)", borderRadius: "20px", padding: "32px 28px", width: 340, display: "flex", flexDirection: "column", boxSizing: "border-box" },
  modalIconWrap: { width: 42, height: 42, borderRadius: "50%", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.4)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px", fontSize: "18px", color: "#fbbf24" },
  modalTitle: { fontSize: 17, fontWeight: 700, margin: "0 0 8px", color: "#f1f5f9", letterSpacing: "-0.2px" },
  modalDesc: { fontSize: 13, color: "#64748b", margin: "0 0 24px", lineHeight: 1.65 },
  modalActions: { display: "flex", flexDirection: "column", gap: 8 },
  modalExitBtn: { padding: "10px 16px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", color: "#f87171", fontSize: 13, fontWeight: 600, cursor: "pointer", minHeight: "44px" },
  modalCancelBtn: { padding: "10px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#94a3b8", fontSize: 13, fontWeight: 500, cursor: "pointer", minHeight: "44px" },
};
