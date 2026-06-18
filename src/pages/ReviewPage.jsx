import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { useBreakpoint } from "../hooks/useBreakpoint";

const ROLES = [
  { id: "Frontend",  label: "Frontend",  icon: "⬡", desc: "React, CSS, Browser APIs" },
  { id: "Backend",   label: "Backend",   icon: "⬢", desc: "APIs, Databases, Auth" },
  { id: "Fullstack", label: "Fullstack", icon: "◈", desc: "End-to-end systems" },
  { id: "DevOps",    label: "DevOps",    icon: "⬟", desc: "CI/CD, Docker, Cloud" },
];

const DIFFICULTIES = [
  { id: "easy",   label: "Junior",    color: "#22c55e", desc: "0–2 yrs" },
  { id: "medium", label: "Mid-level", color: "#f59e0b", desc: "2–5 yrs" },
  { id: "hard",   label: "Senior",    color: "#ef4444", desc: "5+ yrs" },
];

export default function ReviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;
  const savedRef = useRef(false);
  const bp = useBreakpoint();
  const { isMobile, isTablet } = bp;
  const isSmall = isMobile || isTablet;

  const [showRolePicker, setShowRolePicker] = useState(false);
  const [pickerRole, setPickerRole] = useState(state?.categoryId ?? "Frontend");
  const [pickerDifficulty, setPickerDifficulty] = useState(state?.difficulty ?? "medium");

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!state) {
    return (
      <div style={s.page}>
        <div style={s.ambientTop} />
        <div style={s.grid} />
        <div style={s.centerWrap}>
          <div style={{
            ...s.emptyCard,
            padding: isMobile ? "36px 24px" : "48px 40px",
          }}>
            <span style={s.emptyIcon}>◌</span>
            <h1 style={s.emptyTitle}>No review available</h1>
            <p style={s.emptyDesc}>Complete an interview first to see your results here.</p>
            <button style={s.emptyBtn} onClick={() => navigate("/")}>← Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  const {
    answers = [],
    skipped = [],
    totalScore = 0,
    totalQuestions = 0,
    sessionId,
    categoryId,
    difficulty,
  } = state;

  // ── Save results once ────────────────────────────────────────────────────
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    api.post("/results", {
      session_id: sessionId,
      score: totalScore,
      total_questions: totalQuestions || answers.length + skipped.length,
      skipped: skipped.length,
      category_id: categoryId,
      difficulty,
      answers,
    }).then(() => {
      sessionStorage.clear();
    }).catch((err) => console.error("Failed to save session:", err));
  }, [answers, sessionId, skipped.length, totalQuestions, totalScore]);

  const retryInterview = () => {
    if (categoryId && difficulty) {
      navigate(`/interview?role=${categoryId}&difficulty=${difficulty}&ai=true&t=${Date.now()}`);
      return;
    }
    navigate("/");
  };

  const startPickerInterview = () => {
    setShowRolePicker(false);
    navigate(`/interview?role=${pickerRole}&difficulty=${pickerDifficulty}&ai=true&t=${Date.now()}`);
  };

  const scoreColor = (score) =>
    score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const scoreLabel = (score) =>
    score >= 80 ? "Strong" : score >= 50 ? "Average" : "Needs Work";
  const totalScoreColor = scoreColor(totalScore);

  return (
    <div style={s.page}>
      <div style={s.ambientTop} />
      <div style={s.ambientBottom} />
      <div style={s.grid} />

      {/* ── ROLE PICKER MODAL ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showRolePicker && (
          <motion.div
            style={s.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowRolePicker(false)}
          >
            <motion.div
              style={{
                ...s.modal,
                // On short landscape screens, allow scrolling inside the modal
                maxHeight: "90vh",
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
                padding: isMobile ? "20px 16px" : "24px",
              }}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.2 }}
            >
              {/* Modal header */}
              <div style={s.modalHeader}>
                <div>
                  <h2 style={s.modalTitle}>Choose a role</h2>
                  <p style={s.modalSub}>Pick a role and difficulty to start a new session</p>
                </div>
                {/* Fixed tap target: 44x44 */}
                <button
                  style={s.modalClose}
                  onClick={() => setShowRolePicker(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Difficulty */}
              <p style={s.modalSectionLabel}>Experience level</p>
              <div style={{
                ...s.diffRow,
                // On very small screens stack difficulty buttons vertically
                flexDirection: isMobile && window.innerWidth < 360 ? "column" : "row",
              }}>
                {DIFFICULTIES.map(({ id, label, color, desc }) => (
                  <button
                    key={id}
                    style={{
                      ...s.diffBtn,
                      borderColor: pickerDifficulty === id ? color : "rgba(255,255,255,0.1)",
                      background: pickerDifficulty === id ? `${color}18` : "transparent",
                    }}
                    onClick={() => setPickerDifficulty(id)}
                  >
                    <span style={{ ...s.diffLabel, color: pickerDifficulty === id ? color : "#94a3b8" }}>
                      {label}
                    </span>
                    <span style={s.diffDesc}>{desc}</span>
                  </button>
                ))}
              </div>

              {/* Roles — 1 col on mobile, 2 col on tablet+ */}
              <p style={s.modalSectionLabel}>Role</p>
              <div style={{
                ...s.modalRolesGrid,
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              }}>
                {ROLES.map(({ id, label, icon, desc }) => (
                  <button
                    key={id}
                    style={{
                      ...s.modalRoleBtn,
                      borderColor: pickerRole === id ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.08)",
                      background: pickerRole === id ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.03)",
                    }}
                    onClick={() => setPickerRole(id)}
                  >
                    <span style={s.modalRoleIcon}>{icon}</span>
                    <div>
                      <span style={s.modalRoleName}>{label}</span>
                      <span style={s.modalRoleDesc}>{desc}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer — stack on mobile so long button text doesn't overflow */}
              <div style={{
                ...s.modalFooter,
                flexDirection: isMobile ? "column-reverse" : "row",
              }}>
                <button style={s.modalCancelBtn} onClick={() => setShowRolePicker(false)}>
                  Cancel
                </button>
                <button style={s.modalStartBtn} onClick={startPickerInterview}>
                  Start {pickerRole} interview →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOPBAR ────────────────────────────────────────────────────────── */}
      <nav style={s.nav}>
        <div style={{
          ...s.navInner,
          padding: isMobile ? "0 16px" : "0 24px",
        }}>
          <div style={s.navBrand} onClick={() => navigate("/")}>
            <span style={s.navLogo}>▲</span>
            <span style={s.navName}>InterviewAI</span>
          </div>
          <div style={s.navRight}>
            {!isMobile && (
              <button style={s.navBtn} onClick={() => navigate("/dashboard")}>Dashboard</button>
            )}
            <button style={s.navBtn} onClick={() => navigate("/")}>Home</button>
          </div>
        </div>
      </nav>

      {/* ── MAIN ──────────────────────────────────────────────────────────── */}
      <div style={{
        ...s.main,
        padding: isMobile
          ? "28px 16px 64px"
          : isTablet
          ? "36px 24px 72px"
          : s.main.padding,
      }}>

        {/* PAGE HEADER */}
        <motion.div
          style={{
            ...s.pageHeader,
            flexDirection: isSmall ? "column" : "row",
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 style={{
              ...s.pageTitle,
              fontSize: isMobile ? "22px" : "28px",
            }}>Interview Review</h1>
            <p style={s.pageSub}>
              {categoryId && difficulty && (
                <>
                  <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{categoryId}</span>
                  <span style={{ color: "#334155", margin: "0 6px" }}>·</span>
                  <span style={{
                    color: { easy: "#22c55e", medium: "#f59e0b", hard: "#ef4444" }[difficulty],
                    fontWeight: 600,
                  }}>
                    {{ easy: "Junior", medium: "Mid-level", hard: "Senior" }[difficulty]}
                  </span>
                  <span style={{ color: "#334155", margin: "0 6px" }}>·</span>
                </>
              )}
              Here's how you performed
            </p>
          </div>

          {/* Header action buttons */}
          <div style={{
            ...s.headerActions,
            width: isSmall ? "100%" : "auto",
            flexDirection: isMobile ? "column" : "row",
          }}>
            <button
              style={{ ...s.secondaryBtn, ...(isMobile && { width: "100%" }) }}
              onClick={retryInterview}
            >
              ↺ Retry {categoryId}
            </button>
            <button
              style={{ ...s.primaryBtn, ...(isMobile && { width: "100%" }) }}
              onClick={() => setShowRolePicker(true)}
            >
              Change Role →
            </button>
            {!isMobile && (
              <button style={s.ghostBtn} onClick={() => navigate("/")}>
                Back to Home
              </button>
            )}
          </div>
        </motion.div>

        {/* SCORE SUMMARY */}
        <motion.div
          style={{
            ...s.summaryRow,
            // Stack vertically on mobile — the "1fr auto" breaks at narrow widths
            gridTemplateColumns: isSmall ? "1fr" : "1fr auto",
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Big score */}
          <div style={{
            ...s.bigScoreCard,
            padding: isMobile ? "20px" : "28px 32px",
          }}>
            <span style={s.bigScoreLabel}>Average Score</span>
            <span style={{
              ...s.bigScoreNum,
              color: totalScoreColor,
              // Scale down the huge number on mobile
              fontSize: isMobile ? "40px" : "52px",
              letterSpacing: isMobile ? "-1px" : "-2px",
            }}>
              {totalScore}%
            </span>
            <span style={{ ...s.bigScoreTag, color: totalScoreColor }}>
              {scoreLabel(totalScore)}
            </span>
            <div style={s.bigScoreBar}>
              <motion.div
                style={{ ...s.bigScoreBarFill, background: totalScoreColor }}
                initial={{ width: 0 }}
                animate={{ width: `${totalScore}%` }}
                transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Mini stat cards — row on mobile (fits nicely), column on desktop */}
          <div style={{
            ...s.miniStats,
            flexDirection: isSmall ? "row" : "column",
            minWidth: isSmall ? "unset" : "160px",
          }}>
            {[
              { label: "Answered", value: answers.length, icon: "◎" },
              { label: "Skipped",  value: skipped.length,  icon: "◌" },
              { label: "Total",    value: totalQuestions || answers.length + skipped.length, icon: "◉" },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{
                ...s.miniStat,
                flex: isSmall ? 1 : "unset",
                padding: isMobile ? "12px 10px" : "16px 20px",
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "center" : "center",
                gap: isMobile ? "4px" : "12px",
                textAlign: isMobile ? "center" : "left",
              }}>
                <span style={s.miniStatIcon}>{icon}</span>
                <span style={{
                  ...s.miniStatValue,
                  fontSize: isMobile ? "16px" : "18px",
                }}>{value}</span>
                <span style={s.miniStatLabel}>{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* NO ANSWERS */}
        {answers.length === 0 ? (
          <div style={{
            ...s.emptyAnswers,
            padding: isMobile ? "40px 16px" : "60px 24px",
          }}>
            <span style={s.emptyIcon}>◌</span>
            <p style={s.emptyTitle}>No answers submitted</p>
            <p style={s.emptyDesc}>
              You skipped all questions. Try again and submit at least one response.
            </p>
            <div style={{
              display: "flex",
              gap: "10px",
              flexDirection: isMobile ? "column" : "row",
              width: isMobile ? "100%" : "auto",
            }}>
              <button
                style={{ ...s.secondaryBtn, ...(isMobile && { width: "100%" }) }}
                onClick={retryInterview}
              >
                ↺ Retry {categoryId}
              </button>
              <button
                style={{ ...s.primaryBtn, ...(isMobile && { width: "100%" }) }}
                onClick={() => setShowRolePicker(true)}
              >
                Change Role →
              </button>
            </div>
          </div>
        ) : (
          <div style={s.answerList}>
            <div style={s.listHeader}>
              <h2 style={s.listTitle}>Question Breakdown</h2>
              <span style={s.listCount}>{answers.length} answered</span>
            </div>

            {answers.map((a, i) => (
              <motion.div
                key={i}
                style={{
                  ...s.answerCard,
                  padding: isMobile ? "16px" : "24px",
                }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                {/* Card header */}
                <div style={s.cardTop}>
                  <span style={s.cardNum}>Q{i + 1}</span>
                  <div style={s.cardScore}>
                    <div style={{
                      ...s.cardScoreDot,
                      background: scoreColor(a.score),
                      boxShadow: `0 0 8px ${scoreColor(a.score)}60`,
                    }} />
                    <span style={{ ...s.cardScoreNum, color: scoreColor(a.score) }}>
                      {a.score}%
                    </span>
                    <span style={{ ...s.cardScoreTag, color: scoreColor(a.score) }}>
                      {scoreLabel(a.score)}
                    </span>
                  </div>
                </div>

                <h3 style={{
                  ...s.cardQuestion,
                  fontSize: isMobile ? "15px" : "17px",
                }}>{a.question}</h3>

                <div style={s.cardBar}>
                  <motion.div
                    style={{ ...s.cardBarFill, background: scoreColor(a.score) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${a.score}%` }}
                    transition={{ delay: i * 0.07 + 0.3, duration: 0.8, ease: "easeOut" }}
                  />
                </div>

                <div style={s.answerBlock}>
                  <span style={s.blockLabel}>Your Answer</span>
                  <p style={s.answerText}>{a.answer}</p>
                </div>

                {(a.explanation || a.feedback) && (
                  <div style={s.feedbackBlock}>
                    <span style={s.feedbackLabel}>AI Feedback</span>
                    {a.provisional && (
                      <span style={s.provisionalBadge}>
                        Provisional score — resubmit for full AI grading
                      </span>
                    )}
                    <p style={s.feedbackText}>{a.explanation || a.feedback}</p>
                  </div>
                )}

                {a.improvedAnswer && (
                  <div style={s.improvedBlock}>
                    <span style={s.improvedLabel}>Better Answer</span>
                    <p style={s.improvedText}>{a.improvedAnswer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* BOTTOM ACTIONS */}
        <motion.div
          style={{
            ...s.bottomActions,
            flexDirection: isMobile ? "column" : "row",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            style={{ ...s.secondaryBtn, ...(isMobile && { width: "100%" }) }}
            onClick={retryInterview}
          >
            ↺ Retry {categoryId}
          </button>
          <button
            style={{ ...s.primaryBtn, ...(isMobile && { width: "100%" }) }}
            onClick={() => setShowRolePicker(true)}
          >
            Change Role →
          </button>
          <button
            style={{ ...s.ghostBtn, ...(isMobile && { width: "100%" }) }}
            onClick={() => { sessionStorage.clear(); navigate("/dashboard"); }}
          >
            View Dashboard
          </button>
          <button
            style={{ ...s.ghostBtn, ...(isMobile && { width: "100%" }) }}
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </motion.div>
      </div>
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
  ambientBottom: {
    position: "fixed",
    bottom: "-200px",
    left: "-100px",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
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

  // NAV
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(8,12,20,0.9)",
    backdropFilter: "blur(16px)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  navInner: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "0 24px",
    height: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  },
  navLogo: { fontSize: "14px", color: "#6366f1" },
  navName: { fontSize: "14px", fontWeight: "700", color: "#f1f5f9" },
  navRight: { display: "flex", gap: "8px" },
  navBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "8px 14px",
    borderRadius: "6px",
    color: "#64748b",
    fontSize: "12px",
    cursor: "pointer",
    minHeight: "44px",
    minWidth: "44px",
    whiteSpace: "nowrap",
  },

  // MAIN
  main: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "48px 24px 80px",
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },

  // PAGE HEADER
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "16px",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: "-0.5px",
    margin: "0 0 4px",
  },
  pageSub: { fontSize: "14px", color: "#475569", margin: 0 },
  headerActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },

  // BUTTONS
  primaryBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    background: "#6366f1",
    color: "white",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    minHeight: "44px",
    whiteSpace: "nowrap",
  },
  secondaryBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "transparent",
    color: "#64748b",
    fontSize: "13px",
    cursor: "pointer",
    minHeight: "44px",
    whiteSpace: "nowrap",
  },
  ghostBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.06)",
    background: "transparent",
    color: "#334155",
    fontSize: "13px",
    cursor: "pointer",
    minHeight: "44px",
    whiteSpace: "nowrap",
  },

  // SUMMARY
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "16px",
    alignItems: "stretch",
  },
  bigScoreCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "28px 32px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  bigScoreLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  bigScoreNum: {
    fontSize: "52px",
    fontWeight: "800",
    letterSpacing: "-2px",
    lineHeight: 1,
  },
  bigScoreTag: {
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "8px",
  },
  bigScoreBar: {
    height: "3px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "2px",
    overflow: "hidden",
    marginTop: "4px",
  },
  bigScoreBarFill: {
    height: "100%",
    borderRadius: "2px",
  },
  miniStats: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minWidth: "160px",
  },
  miniStat: {
    flex: 1,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "10px",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  miniStatIcon: { fontSize: "14px", color: "#334155", flexShrink: 0 },
  miniStatValue: { fontSize: "18px", fontWeight: "800", color: "#f1f5f9", letterSpacing: "-0.5px" },
  miniStatLabel: { fontSize: "11px", color: "#475569", fontWeight: "500" },

  // ANSWER LIST
  answerList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listTitle: { fontSize: "16px", fontWeight: "700", color: "#f1f5f9", margin: 0 },
  listCount: { fontSize: "12px", color: "#334155" },

  // ANSWER CARD
  answerCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardNum: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  cardScore: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  cardScoreDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  cardScoreNum: {
    fontSize: "16px",
    fontWeight: "800",
    letterSpacing: "-0.3px",
  },
  cardScoreTag: {
    fontSize: "11px",
    fontWeight: "600",
  },
  cardQuestion: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#f1f5f9",
    margin: 0,
    lineHeight: "1.4",
    letterSpacing: "-0.2px",
  },
  cardBar: {
    height: "2px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "1px",
    overflow: "hidden",
  },
  cardBarFill: {
    height: "100%",
    borderRadius: "1px",
  },
  answerBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  blockLabel: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  answerText: {
    fontSize: "14px",
    color: "#94a3b8",
    lineHeight: "1.65",
    margin: 0,
  },
  feedbackBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "8px",
    padding: "14px 16px",
  },
  feedbackLabel: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#6366f1",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  provisionalBadge: {
    display: "block",
    marginTop: "6px",
    marginBottom: "6px",
    fontSize: "11px",
    fontWeight: "600",
    color: "#f59e0b",
  },
  feedbackText: {
    fontSize: "13px",
    color: "#64748b",
    lineHeight: "1.65",
    margin: 0,
  },
  improvedBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    background: "rgba(34,197,94,0.04)",
    border: "1px solid rgba(34,197,94,0.12)",
    borderRadius: "8px",
    padding: "14px 16px",
  },
  improvedLabel: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#22c55e",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  improvedText: {
    fontSize: "13px",
    color: "#4ade80",
    lineHeight: "1.65",
    margin: 0,
  },

  // BOTTOM ACTIONS
  bottomActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    paddingTop: "8px",
  },

  // EMPTY STATES
  centerWrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    position: "relative",
    zIndex: 1,
  },
  emptyCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "20px",
    padding: "48px 40px",
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    boxSizing: "border-box",
  },
  emptyIcon: {
    fontSize: "28px",
    color: "#334155",
    display: "block",
    marginBottom: "8px",
  },
  emptyTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#f1f5f9",
    margin: 0,
  },
  emptyDesc: {
    fontSize: "14px",
    color: "#475569",
    margin: "0 0 16px",
    lineHeight: "1.6",
  },
  emptyBtn: {
    background: "rgba(99,102,241,0.1)",
    border: "1px solid rgba(99,102,241,0.2)",
    padding: "10px 20px",
    borderRadius: "8px",
    color: "#818cf8",
    fontSize: "14px",
    cursor: "pointer",
    minHeight: "44px",
  },
  emptyAnswers: {
    padding: "60px 24px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
  },

  // MODAL
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 200,
    padding: "16px",
    boxSizing: "border-box",
  },
  modal: {
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "24px",
    width: "100%",
    maxWidth: "480px",
    boxSizing: "border-box",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    gap: "12px",
  },
  modalTitle: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#f1f5f9",
    margin: 0,
  },
  modalSub: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "3px",
    margin: "3px 0 0",
  },
  // 44x44 tap target
  modalClose: {
    width: "44px",
    height: "44px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "transparent",
    cursor: "pointer",
    color: "#64748b",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  modalSectionLabel: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "8px",
    marginTop: 0,
  },
  diffRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px",
  },
  diffBtn: {
    flex: 1,
    padding: "8px 6px",
    borderRadius: "8px",
    border: "1px solid",
    background: "transparent",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.15s",
    minHeight: "44px",
  },
  diffLabel: {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
  },
  diffDesc: {
    display: "block",
    fontSize: "11px",
    color: "#64748b",
    marginTop: "2px",
  },
  modalRolesGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginBottom: "20px",
  },
  modalRoleBtn: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textAlign: "left",
    transition: "all 0.15s",
    minHeight: "52px",
  },
  modalRoleIcon: {
    fontSize: "18px",
    width: "24px",
    textAlign: "center",
    color: "#94a3b8",
    flexShrink: 0,
  },
  modalRoleName: {
    display: "block",
    fontSize: "13px",
    fontWeight: 500,
    color: "#e2e8f0",
  },
  modalRoleDesc: {
    display: "block",
    fontSize: "11px",
    color: "#64748b",
    marginTop: "2px",
  },
  modalFooter: {
    display: "flex",
    gap: "8px",
  },
  modalCancelBtn: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "transparent",
    color: "#64748b",
    fontSize: "14px",
    cursor: "pointer",
    minHeight: "44px",
    whiteSpace: "nowrap",
  },
  modalStartBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#6366f1",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    minHeight: "44px",
  },
};