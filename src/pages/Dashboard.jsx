import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useBreakpoint, gridCols } from "../hooks/useBreakpoint";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const bp = useBreakpoint();
  const { isMobile, isTablet } = bp;
  const isSmall = isMobile || isTablet;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const timeAgo = (dateStr) => {
    if (!dateStr) return null;
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  useEffect(() => {
    const cached = sessionStorage.getItem("dashboard_results");
    if (cached) {
      setHistory(JSON.parse(cached));
      setLoading(false);
      return;
    }
    api
      .get("/results")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        sessionStorage.setItem("dashboard_results", JSON.stringify(data));
        setHistory(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const avgScore =
    history.length > 0
      ? Math.round(history.reduce((a, b) => a + b.score, 0) / history.length)
      : null;

  const best =
    history.length > 0 ? Math.max(...history.map((h) => h.score)) : null;

  const trend =
    history.length >= 6
      ? Math.round(
          history.slice(0, 3).reduce((a, b) => a + b.score, 0) / 3 -
            history.slice(-3).reduce((a, b) => a + b.score, 0) / 3
        )
      : history.length >= 2
      ? history[0].score - history[1].score
      : null;

  const scoreColor = (score) =>
    score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const scoreLabel = (score) =>
    score >= 80 ? "Strong" : score >= 50 ? "Average" : "Needs Work";

  // Chart
  const chartData = history.slice(0, 10).reverse();
  const chartMax = 100;
  const chartH = 120;
  const chartW = 560;
  const padL = 32;
  const padR = 16;
  const padT = 12;
  const padB = 24;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const points = chartData.map((h, i) => {
    const x =
      padL +
      (chartData.length === 1 ? innerW / 2 : (i / (chartData.length - 1)) * innerW);
    const y = padT + innerH - (h.score / chartMax) * innerH;
    return { x, y, score: h.score };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath =
    points.length > 0
      ? `M${points[0].x},${padT + innerH} ` +
        points.map((p) => `L${p.x},${p.y}`).join(" ") +
        ` L${points[points.length - 1].x},${padT + innerH} Z`
      : "";

  return (
    <div style={s.page}>
      <div style={s.ambientTop} />
      <div style={s.ambientBottom} />
      <div style={s.grid} />

      {/* TOPBAR */}
      <nav style={s.nav}>
        <div style={{
          ...s.navInner,
          padding: isMobile ? "0 16px" : "0 24px",
        }}>
          <div style={s.navBrand}>
            <span style={s.navLogo}>▲</span>
            <span style={s.navName}>InterviewAI</span>
          </div>
          <div style={s.navRight}>
            {/* Hide username on mobile — too cramped */}
            {!isMobile && (
              <span style={s.navUser}>{user?.name}</span>
            )}
            <button style={s.navBtn} onClick={() => navigate("/")}>Home</button>
            <button style={s.navBtn} onClick={logout}>Logout</button>
          </div>
        </div>
      </nav>

      {/* MAIN */}
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
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "flex-start",
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 style={{
              ...s.pageTitle,
              fontSize: isMobile ? "22px" : "28px",
            }}>Dashboard</h1>
            <p style={s.pageSub}>Track your interview performance over time.</p>
          </div>
          <button
            style={{
              ...s.startBtn,
              width: isMobile ? "100%" : "auto",
            }}
            onClick={() => navigate("/")}
          >
            + New Interview
          </button>
        </motion.div>

        {/* STATS ROW */}
        {history.length > 0 && (
          <motion.div
            style={{
              ...s.statsRow,
              // On xs (1-col), the 1px gap trick looks odd — switch to normal gap
              gridTemplateColumns: gridCols({ xs: 2, sm: 2, lg: 4 }, bp),
              gap: isMobile ? "1px" : "1px",
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {[
              { label: "Sessions", value: history.length },
              { label: "Average Score", value: avgScore !== null ? `${avgScore}%` : "—" },
              { label: "Best Score", value: best !== null ? `${best}%` : "—" },
              {
                label: "Trend",
                value:
                  trend === null
                    ? "—"
                    : trend > 0
                    ? `↑ ${trend}%`
                    : trend < 0
                    ? `↓ ${Math.abs(trend)}%`
                    : "→ Stable",
                color:
                  trend === null
                    ? null
                    : trend > 0
                    ? "#22c55e"
                    : trend < 0
                    ? "#ef4444"
                    : "#f59e0b",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                style={{
                  ...s.statCard,
                  padding: isMobile ? "16px 14px" : "24px 20px",
                }}
              >
                <span style={{
                  ...s.statValue,
                  color: color || "#f1f5f9",
                  fontSize: isMobile ? "20px" : "24px",
                }}>
                  {value}
                </span>
                <span style={s.statLabel}>{label}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* SCORE HISTORY CHART */}
        {history.length >= 2 && (
          <motion.div
            style={{
              ...s.chartCard,
              padding: isMobile ? "16px" : "24px",
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div style={s.chartHeader}>
              <span style={s.chartTitle}>Score History</span>
              <span style={s.chartSub}>Last {Math.min(history.length, 10)} sessions</span>
            </div>

            {/* overflowX: auto lets the fixed-width SVG scroll on narrow screens */}
            <div style={s.chartWrap}>
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                style={{ width: "100%", minWidth: "320px", height: "auto", overflow: "visible" }}
              >
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                </defs>

                {[0, 25, 50, 75, 100].map((v) => {
                  const y = padT + innerH - (v / 100) * innerH;
                  return (
                    <g key={v}>
                      <line
                        x1={padL} y1={y} x2={padL + innerW} y2={y}
                        stroke="rgba(255,255,255,0.05)" strokeWidth="1"
                      />
                      <text x={padL - 6} y={y + 4} fontSize="9" fill="#334155" textAnchor="end">
                        {v}
                      </text>
                    </g>
                  );
                })}

                {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

                {points.length > 1 && (
                  <polyline
                    points={polyline}
                    fill="none"
                    stroke="url(#lineGrad)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {points.map((p, i) => (
                  <g key={i}>
                    <circle
                      cx={p.x} cy={p.y} r="4"
                      fill={scoreColor(p.score)}
                      stroke="#080c14" strokeWidth="2"
                    />
                    <text
                      x={p.x} y={p.y - 8}
                      fontSize="9" fill={scoreColor(p.score)}
                      textAnchor="middle" fontWeight="700"
                    >
                      {p.score}%
                    </text>
                    <text
                      x={p.x} y={padT + innerH + 14}
                      fontSize="9" fill="#334155" textAnchor="middle"
                    >
                      S{i + 1}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div style={{ ...s.chartLegend, gap: isMobile ? "12px" : "20px" }}>
              {[
                { label: "Strong (80%+)", color: "#22c55e" },
                { label: "Average (50–79%)", color: "#f59e0b" },
                { label: "Needs Work (<50%)", color: "#ef4444" },
              ].map(({ label, color }) => (
                <div key={label} style={s.legendItem}>
                  <div style={{ ...s.legendDot, background: color }} />
                  <span style={s.legendLabel}>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* HISTORY TABLE / CARDS */}
        <motion.div
          style={s.section}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>Past Sessions</h2>
            <span style={s.sectionCount}>{history.length} total</span>
          </div>

          <div style={s.table}>
            {loading ? (
              <div style={s.emptyState}>
                <p style={s.emptyText}>Loading sessions...</p>
              </div>
            ) : history.length === 0 ? (
              <div style={s.emptyState}>
                <span style={s.emptyIcon}>◌</span>
                <p style={s.emptyText}>No sessions yet</p>
                <p style={s.emptySub}>Complete your first interview to see results here.</p>
                <button style={s.emptyBtn} onClick={() => navigate("/")}>
                  Start Interview →
                </button>
              </div>
            ) : isSmall ? (
              /* ── MOBILE / TABLET: card list ── */
              <div style={s.mobileSessionList}>
                {history.map((h, i) => (
                  <motion.div
                    key={h.id}
                    style={s.mobileSessionCard}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => navigate(`/results/${h.id}`)}
                  >
                    {/* Top row: session# + score */}
                    <div style={s.mobileSessionTop}>
                      <span style={s.sessionNum}>#{history.length - i}</span>
                      <span style={{ ...s.scoreNum, color: scoreColor(h.score) }}>
                        {h.score}%
                      </span>
                    </div>

                    {/* Mini progress bar */}
                    <div style={s.mobileMiniBar}>
                      <div style={{
                        ...s.mobileMiniBarFill,
                        width: `${h.score}%`,
                        background: scoreColor(h.score),
                      }} />
                    </div>

                    {/* Meta row */}
                    <div style={s.mobileSessionMeta}>
                      <span style={s.mobileMetaChip}>{h.category_id ?? "—"}</span>
                      <span style={s.mobileMetaChip}>{h.total_questions} Qs</span>
                      {h.skipped > 0 && (
                        <span style={{ ...s.mobileMetaChip, color: "#f59e0b", borderColor: "rgba(245,158,11,0.2)" }}>
                          {h.skipped} skipped
                        </span>
                      )}
                      <span style={{ ...s.mobileMetaChip, marginLeft: "auto" }}>
                        {timeAgo(h.created_at) ?? "—"}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* ── DESKTOP: scrollable table ── */
              <div style={s.tableScroll}>
                <div style={{ ...s.tableHeader, minWidth: 680 }}>
                  <span>#</span>
                  <span>Score</span>
                  <span>Performance</span>
                  <span>Questions</span>
                  <span>Skipped</span>
                  <span>Role</span>
                  <span>When</span>
                </div>
                {history.map((h, i) => (
                  <motion.div
                    key={h.id}
                    style={{ ...s.tableRow, minWidth: 680 }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(255,255,255,0.03)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                    onClick={() => navigate(`/results/${h.id}`)}
                  >
                    <span style={s.sessionNum}>#{history.length - i}</span>

                    <div style={s.scoreCell}>
                      <div style={{
                        ...s.scoreDot,
                        background: scoreColor(h.score),
                        boxShadow: `0 0 8px ${scoreColor(h.score)}60`,
                      }} />
                      <span style={{ ...s.scoreNum, color: scoreColor(h.score) }}>
                        {h.score}%
                      </span>
                    </div>

                    <div style={s.scoreBarCell}>
                      <div style={s.miniBar}>
                        <div style={{
                          ...s.miniBarFill,
                          width: `${h.score}%`,
                          background: scoreColor(h.score),
                        }} />
                      </div>
                      <span style={{ ...s.scoreTag, color: scoreColor(h.score) }}>
                        {scoreLabel(h.score)}
                      </span>
                    </div>

                    <span style={s.cellText}>{h.total_questions}</span>
                    <span style={{
                      ...s.cellText,
                      color: h.skipped > 0 ? "#f59e0b" : "#475569",
                    }}>
                      {h.skipped > 0 ? `${h.skipped} skipped` : "—"}
                    </span>
                    <span style={{ ...s.cellText, fontSize: 12, color: "#64748b" }}>
                      {h.category_id ?? "—"}
                    </span>
                    <span style={{ ...s.cellText, color: "#334155", fontSize: 12 }}>
                      {timeAgo(h.created_at) ?? "—"}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
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
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
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
  navBrand: { display: "flex", alignItems: "center", gap: "8px" },
  navLogo: { fontSize: "14px", color: "#6366f1" },
  navName: { fontSize: "14px", fontWeight: "700", color: "#f1f5f9" },
  navRight: { display: "flex", alignItems: "center", gap: "8px" },
  navUser: { fontSize: "13px", color: "#475569", marginRight: "4px" },
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
    gap: "24px",
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
  startBtn: {
    background: "#6366f1",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    color: "white",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    minHeight: "44px",
    flexShrink: 0,
  },

  // STATS
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    overflow: "hidden",
  },
  statCard: {
    padding: "24px 20px",
    background: "#080c14",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },
  statLabel: { fontSize: "11px", color: "#475569", fontWeight: "500" },

  // CHART
  chartCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "24px",
  },
  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  chartTitle: { fontSize: "14px", fontWeight: "700", color: "#f1f5f9" },
  chartSub: { fontSize: "11px", color: "#334155" },
  chartWrap: {
    width: "100%",
    overflowX: "auto",
    // Prevents chart from forcing page-level horizontal scroll
    WebkitOverflowScrolling: "touch",
  },
  chartLegend: {
    display: "flex",
    gap: "20px",
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid rgba(255,255,255,0.04)",
    flexWrap: "wrap",
  },
  legendItem: { display: "flex", alignItems: "center", gap: "6px" },
  legendDot: { width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0 },
  legendLabel: { fontSize: "11px", color: "#475569" },

  // SECTION
  section: { display: "flex", flexDirection: "column", gap: "16px" },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: "16px", fontWeight: "700", color: "#f1f5f9", margin: 0 },
  sectionCount: { fontSize: "12px", color: "#334155" },

  // TABLE WRAPPER
  table: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    overflow: "hidden",
  },
  // Desktop scrollable inner wrapper — keeps overflow contained within the card
  tableScroll: {
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "40px 80px 1.5fr 80px 100px 80px 80px",
    padding: "12px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontSize: "11px",
    fontWeight: "600",
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableRow: {
    display: "grid",
    gridTemplateColumns: "40px 80px 1.5fr 80px 100px 80px 80px",
    padding: "14px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    alignItems: "center",
    transition: "background 0.15s",
    cursor: "pointer",
  },
  sessionNum: { fontSize: "11px", color: "#334155", fontWeight: "600" },
  scoreCell: { display: "flex", alignItems: "center", gap: "8px" },
  scoreDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
  scoreNum: { fontSize: "15px", fontWeight: "700" },
  scoreBarCell: { display: "flex", flexDirection: "column", gap: "4px" },
  miniBar: {
    height: "3px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "2px",
    overflow: "hidden",
    width: "80px",
  },
  miniBarFill: {
    height: "100%",
    borderRadius: "2px",
    transition: "width 0.6s ease",
  },
  scoreTag: { fontSize: "11px", fontWeight: "600" },
  cellText: { fontSize: "13px", color: "#475569" },

  // ── MOBILE CARD LIST (was entirely missing) ──────────────────────────────
  mobileSessionList: {
    display: "flex",
    flexDirection: "column",
  },
  mobileSessionCard: {
    padding: "16px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    transition: "background 0.15s",
    // Tap highlight
    WebkitTapHighlightColor: "rgba(99,102,241,0.08)",
  },
  mobileSessionTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mobileMiniBar: {
    height: "3px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "2px",
    overflow: "hidden",
  },
  mobileMiniBarFill: {
    height: "100%",
    borderRadius: "2px",
  },
  mobileSessionMeta: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexWrap: "wrap",
  },
  mobileMetaChip: {
    fontSize: "11px",
    color: "#475569",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "4px",
    padding: "2px 7px",
  },

  // EMPTY STATE
  emptyState: {
    padding: "60px 24px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  emptyIcon: { fontSize: "28px", color: "#334155", display: "block", marginBottom: "8px" },
  emptyText: { fontSize: "15px", fontWeight: "600", color: "#475569", margin: 0 },
  emptySub: { fontSize: "13px", color: "#334155", margin: "0 0 20px" },
  emptyBtn: {
    background: "rgba(99,102,241,0.1)",
    border: "1px solid rgba(99,102,241,0.2)",
    padding: "10px 20px",
    borderRadius: "8px",
    color: "#818cf8",
    fontSize: "13px",
    cursor: "pointer",
    minHeight: "44px",
  },
};
