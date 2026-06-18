import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { useBreakpoint } from "../hooks/useBreakpoint";

export default function ResultDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const bp = useBreakpoint();
  const { isMobile, isTablet } = bp;

  useEffect(() => {
    const cacheKey = `result_${id}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      setResult(JSON.parse(cached));
      setLoading(false);
      return;
    }

    api.get(`/results/${id}`)
      .then((res) => {
        sessionStorage.setItem(cacheKey, JSON.stringify(res.data));
        setResult(res.data);
      })
      .catch(() => setError("Could not load session details."))
      .finally(() => setLoading(false));
  }, [id]);
  
  const scoreColor = (score) =>
    score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

  const scoreLabel = (score) =>
    score >= 80 ? "Strong" : score >= 50 ? "Average" : "Needs Work";

  if (loading) {
    return (
      <div style={s.page}>
        <div style={s.ambientTop} />
        <div style={s.grid} />
        <div style={s.centerWrap}>
          <motion.div style={s.loadingCard} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div
              style={s.spinner}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
            <p style={s.loadingText}>Loading session details...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div style={s.page}>
        <div style={s.ambientTop} />
        <div style={s.grid} />
        <div style={s.centerWrap}>
          <div style={{ ...s.emptyCard, padding: isMobile ? "32px 20px" : "48px 40px" }}>
            <span style={s.emptyIcon}>⚠</span>
            <h2 style={s.emptyTitle}>Session not found</h2>
            <p style={s.emptyDesc}>{error || "This session does not exist."}</p>
            <button style={s.backBtn} onClick={() => navigate("/dashboard")}>
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const answers = result.answers ?? [];
  const totalScore = result.score;

  return (
    <div style={s.page}>
      <div style={s.ambientTop} />
      <div style={s.ambientBottom} />
      <div style={s.grid} />

      {/* NAV */}
      <nav style={s.nav}>
        <div style={{ ...s.navInner, padding: isMobile ? "0 16px" : "0 24px" }}>
          <div style={s.navBrand} onClick={() => navigate("/")}>
            <span style={s.navLogo}>▲</span>
            <span style={s.navName}>InterviewAI</span>
          </div>
          <div style={s.navRight}>
            <button style={s.navBtn} onClick={() => navigate("/dashboard")}>
              ← Dashboard
            </button>
            {!isMobile && (
              <button style={s.navBtnPrimary} onClick={() => navigate("/")}>
                New Interview
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <div style={{
        ...s.main,
        padding: isMobile ? "24px 16px 64px" : isTablet ? "36px 24px 72px" : "48px 24px 80px",
      }}>

        {/* HEADER */}
        <motion.div
          style={{
            ...s.pageHeader,
            flexDirection: isMobile ? "column" : "row",
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 style={{
              ...s.pageTitle,
              fontSize: isMobile ? "22px" : "28px",
            }}>Session Review</h1>
            <p style={s.pageSub}>
              {result.total_questions} questions · {result.skipped} skipped
            </p>
          </div>

          <div style={{
            ...s.scoreBadge,
            alignItems: isMobile ? "flex-start" : "flex-end",
          }}>
            <span style={{ ...s.scoreBig, color: scoreColor(totalScore) }}>
              {totalScore}%
            </span>
            <span style={{ ...s.scoreTag, color: scoreColor(totalScore) }}>
              {scoreLabel(totalScore)}
            </span>
          </div>
        </motion.div>

        {/* SCORE BAR */}
        <motion.div
          style={s.scoreBarWrap}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div style={s.scoreBarTrack}>
            <motion.div
              style={{ ...s.scoreBarFill, background: scoreColor(totalScore) }}
              initial={{ width: 0 }}
              animate={{ width: `${totalScore}%` }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* MINI STATS */}
        <motion.div
          style={{
            ...s.miniStats,
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {[
            { label: "Answered", value: answers.length },
            { label: "Skipped", value: result.skipped },
            { label: "Total", value: result.total_questions },
            {
              label: "Avg per question",
              value: answers.length > 0
                ? `${Math.round(answers.reduce((a, b) => a + (b.score ?? 0), 0) / answers.length)}%`
                : "—"
            },
          ].map(({ label, value }) => (
            <div key={label} style={{ ...s.miniStat, padding: isMobile ? "14px 12px" : "20px 16px" }}>
              <span style={{ ...s.miniStatValue, fontSize: isMobile ? "18px" : "20px" }}>{value}</span>
              <span style={s.miniStatLabel}>{label}</span>
            </div>
          ))}
        </motion.div>

        {/* QUESTION BREAKDOWN */}
        {answers.length === 0 ? (
          <div style={{ ...s.emptyAnswers, padding: isMobile ? "36px 16px" : "48px 24px" }}>
            <span style={s.emptyIcon}>◌</span>
            <p style={s.emptyTitle}>No answers recorded</p>
            <p style={s.emptyDesc}>All questions were skipped in this session.</p>
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
                style={s.answerCard}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                {/* CARD TOP */}
                <div
                  style={{ ...s.cardTop, padding: isMobile ? "14px 14px 10px" : "20px 20px 12px" }}
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  <div style={s.cardTopLeft}>
                    <span style={s.cardNum}>Q{i + 1}</span>
                    <p style={{
                      ...s.cardQuestion,
                      fontSize: isMobile ? "14px" : "15px",
                    }}>{a.question}</p>
                  </div>
                  <div style={s.cardTopRight}>
                    <div style={s.cardScoreWrap}>
                      <div style={{
                        ...s.cardScoreDot,
                        background: scoreColor(a.score ?? 0),
                        boxShadow: `0 0 8px ${scoreColor(a.score ?? 0)}60`,
                      }} />
                      <span style={{ ...s.cardScoreNum, color: scoreColor(a.score ?? 0) }}>
                        {a.score ?? 0}%
                      </span>
                    </div>
                    <span style={s.expandIcon}>{expanded === i ? "↑" : "↓"}</span>
                  </div>
                </div>

                {/* MINI SCORE BAR */}
                <div style={{ ...s.cardBar, margin: isMobile ? "0 14px" : "0 20px" }}>
                  <motion.div
                    style={{ ...s.cardBarFill, background: scoreColor(a.score ?? 0) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${a.score ?? 0}%` }}
                    transition={{ delay: i * 0.06 + 0.2, duration: 0.6 }}
                  />
                </div>

                {/* EXPANDED DETAILS */}
                <AnimatePresence>
                  {expanded === i && (
                    <motion.div
                      style={{ ...s.cardBody, padding: isMobile ? "14px" : "20px" }}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div style={s.block}>
                        <span style={s.blockLabel}>Your Answer</span>
                        <p style={s.blockText}>{a.answer}</p>
                      </div>

                      {(a.explanation || a.feedback) && (
                        <div style={{ ...s.block, ...s.feedbackBlock }}>
                          <span style={{ ...s.blockLabel, color: "#6366f1" }}>AI Feedback</span>
                          <p style={s.blockText}>{a.explanation || a.feedback}</p>
                        </div>
                      )}

                      {a.improvedAnswer && (
                        <div style={{ ...s.block, ...s.improvedBlock }}>
                          <span style={{ ...s.blockLabel, color: "#22c55e" }}>Better Answer</span>
                          <p style={{ ...s.blockText, color: "#4ade80" }}>{a.improvedAnswer}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
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
    position: "fixed", top: "-200px", right: "-100px",
    width: "600px", height: "600px",
    background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
    pointerEvents: "none", zIndex: 0,
  },
  ambientBottom: {
    position: "fixed", bottom: "-200px", left: "-100px",
    width: "500px", height: "500px",
    background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
    pointerEvents: "none", zIndex: 0,
  },
  grid: {
    position: "fixed", inset: 0,
    backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
    backgroundSize: "80px 80px", pointerEvents: "none", zIndex: 0,
  },
  nav: {
    position: "sticky", top: 0, zIndex: 100,
    background: "rgba(8,12,20,0.9)", backdropFilter: "blur(16px)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  navInner: {
    maxWidth: "900px", margin: "0 auto", padding: "0 24px",
    height: "56px", display: "flex", alignItems: "center",
    justifyContent: "space-between",
  },
  navBrand: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" },
  navLogo: { fontSize: "14px", color: "#6366f1" },
  navName: { fontSize: "14px", fontWeight: "700", color: "#f1f5f9" },
  navRight: { display: "flex", gap: "8px" },
  navBtn: {
    background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
    padding: "8px 12px", borderRadius: "6px", color: "#64748b",
    fontSize: "12px", cursor: "pointer", minHeight: "44px",
  },
  navBtnPrimary: {
    background: "#6366f1", border: "none",
    padding: "8px 14px", borderRadius: "6px", color: "white",
    fontSize: "12px", fontWeight: "600", cursor: "pointer", minHeight: "44px",
  },
  main: {
    maxWidth: "900px", margin: "0 auto", padding: "48px 24px 80px",
    position: "relative", zIndex: 1,
    display: "flex", flexDirection: "column", gap: "24px",
  },
  pageHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", flexWrap: "wrap", gap: "16px",
  },
  pageTitle: {
    fontSize: "28px", fontWeight: "800", color: "#f1f5f9",
    letterSpacing: "-0.5px", margin: "0 0 4px",
  },
  pageSub: { fontSize: "14px", color: "#475569", margin: 0 },
  scoreBadge: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" },
  scoreBig: { fontSize: "40px", fontWeight: "800", letterSpacing: "-1.5px", lineHeight: 1 },
  scoreTag: { fontSize: "12px", fontWeight: "600" },
  scoreBarWrap: { marginTop: "-8px" },
  scoreBarTrack: {
    height: "3px", background: "rgba(255,255,255,0.06)",
    borderRadius: "2px", overflow: "hidden",
  },
  scoreBarFill: { height: "100%", borderRadius: "2px" },
  miniStats: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1px", background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", overflow: "hidden",
  },
  miniStat: {
    padding: "20px 16px", background: "#080c14",
    display: "flex", flexDirection: "column", gap: "4px",
  },
  miniStatValue: { fontSize: "20px", fontWeight: "800", color: "#f1f5f9", letterSpacing: "-0.5px" },
  miniStatLabel: { fontSize: "11px", color: "#475569", fontWeight: "500" },
  answerList: { display: "flex", flexDirection: "column", gap: "12px" },
  listHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  listTitle: { fontSize: "16px", fontWeight: "700", color: "#f1f5f9", margin: 0 },
  listCount: { fontSize: "12px", color: "#334155" },
  answerCard: {
    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px", overflow: "hidden",
  },
  cardTop: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "20px 20px 12px", cursor: "pointer", gap: "16px",
  },
  cardTopLeft: { display: "flex", alignItems: "flex-start", gap: "10px", flex: 1 },
  cardNum: {
    fontSize: "10px", fontWeight: "700", color: "#334155",
    textTransform: "uppercase", letterSpacing: "0.5px",
    flexShrink: 0, marginTop: "2px",
  },
  cardQuestion: { fontSize: "15px", fontWeight: "600", color: "#f1f5f9", margin: 0, lineHeight: "1.4" },
  cardTopRight: { display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 },
  cardScoreWrap: { display: "flex", alignItems: "center", gap: "6px" },
  cardScoreDot: { width: "7px", height: "7px", borderRadius: "50%" },
  cardScoreNum: { fontSize: "15px", fontWeight: "700" },
  expandIcon: { fontSize: "12px", color: "#334155" },
  cardBar: { height: "2px", background: "rgba(255,255,255,0.04)", overflow: "hidden", margin: "0 20px" },
  cardBarFill: { height: "100%" },
  cardBody: {
    padding: "20px", display: "flex", flexDirection: "column",
    gap: "16px", borderTop: "1px solid rgba(255,255,255,0.04)", overflow: "hidden",
  },
  block: { display: "flex", flexDirection: "column", gap: "6px" },
  blockLabel: {
    fontSize: "10px", fontWeight: "700", color: "#334155",
    textTransform: "uppercase", letterSpacing: "0.5px",
  },
  blockText: { fontSize: "14px", color: "#94a3b8", lineHeight: "1.65", margin: 0 },
  feedbackBlock: {
    background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.1)",
    borderRadius: "8px", padding: "14px 16px",
  },
  improvedBlock: {
    background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.1)",
    borderRadius: "8px", padding: "14px 16px",
  },
  centerWrap: {
    minHeight: "100vh", display: "flex", alignItems: "center",
    justifyContent: "center", padding: "24px", position: "relative", zIndex: 1,
  },
  loadingCard: { display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" },
  spinner: {
    width: "28px", height: "28px",
    border: "2px solid rgba(99,102,241,0.2)", borderTop: "2px solid #6366f1",
    borderRadius: "50%",
  },
  loadingText: { fontSize: "14px", color: "#475569", margin: 0 },
  emptyCard: {
    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px", padding: "48px 40px", textAlign: "center",
    maxWidth: "400px", width: "100%", boxSizing: "border-box",
    display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
  },
  emptyAnswers: {
    padding: "48px 24px", textAlign: "center", display: "flex",
    flexDirection: "column", alignItems: "center", gap: "8px",
    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
  },
  emptyIcon: { fontSize: "28px", color: "#334155", display: "block", marginBottom: "8px" },
  emptyTitle: { fontSize: "18px", fontWeight: "700", color: "#f1f5f9", margin: 0 },
  emptyDesc: { fontSize: "14px", color: "#475569", margin: 0, lineHeight: "1.6" },
  backBtn: {
    background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
    padding: "10px 20px", borderRadius: "8px", color: "#818cf8",
    fontSize: "14px", cursor: "pointer", marginTop: "8px", minHeight: "44px",
  },
};