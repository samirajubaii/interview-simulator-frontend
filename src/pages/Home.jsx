import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import NavbarAuth from "../components/NavbarAuth";
import { useAuth } from "../context/AuthContext";
import { useBreakpoint, gridCols } from "../hooks/useBreakpoint";

const ROLES = [
  { id: "Frontend", label: "Frontend", icon: "⬡", desc: "React, CSS, Browser APIs, Performance" },
  { id: "Backend", label: "Backend", icon: "⬢", desc: "APIs, Databases, Auth, Architecture" },
  { id: "Fullstack", label: "Fullstack", icon: "◈", desc: "End-to-end systems, DevOps, Scaling" },
  { id: "DevOps", label: "DevOps", icon: "⬟", desc: "CI/CD, Docker, Kubernetes, Cloud" },
];

const DIFFICULTIES = [
  { id: "easy", label: "Junior", color: "#22c55e", desc: "0–2 years" },
  { id: "medium", label: "Mid-level", color: "#f59e0b", desc: "2–5 years" },
  { id: "hard", label: "Senior", color: "#ef4444", desc: "5+ years" },
];

const SOCIAL_STATS = [
  { value: "12K+", label: "Interviews Completed" },
  { value: "94%", label: "Candidate Improvement" },
  { value: "500+", label: "Technical Questions" },
  { value: "< 2s", label: "AI Response Time" },
];

const FEATURES = [
  {
    icon: "◎",
    title: "AI-Powered Evaluation",
    desc: "Real-time scoring that mirrors how senior engineers actually assess answers — not keyword matching.",
  },
  {
    icon: "◉",
    title: "Dynamic Question Bank",
    desc: "Every session generates fresh questions tailored to your role and experience level.",
  },
  {
    icon: "◌",
    title: "Detailed Feedback",
    desc: "Know exactly what you got right, what you missed, and how to answer better next time.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [hoveredRole, setHoveredRole] = useState(null);
  const heroRef = useRef(null);
  const navRef = useRef(null);
  const pendingScrollRef = useRef(null);
  const [realStats, setRealStats] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const bp = useBreakpoint();
  const { isMobile, isTablet } = bp;
  const isSmall = isMobile || isTablet;

  

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get("/results")
      .then((res) => {
        const sessions = Array.isArray(res.data) ? res.data : [];
        if (sessions.length === 0) return;
        const avg = Math.round(
          sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length
        );
        setRealStats({
          sessions: sessions.length,
          avg,
          best: Math.max(...sessions.map((s) => s.score)),
        });
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const displayStats =
    isAuthenticated && realStats
      ? [
          { value: realStats.sessions, label: "Your Sessions" },
          { value: `${realStats.avg}%`, label: "Your Avg Score" },
          { value: `${realStats.best}%`, label: "Your Best Score" },
          { value: "< 2s", label: "AI Response Time" },
        ]
      : SOCIAL_STATS;

  // ─── Scroll helpers ────────────────────────────────────────────────────────
  // Scrolls to a section by ID, accounting for sticky nav height.
  // Does NOT check tagName — any element with the ID is valid.
  const scrollToElement = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const navHeight = navRef.current?.offsetHeight ?? 64;
    const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 8;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  // If the mobile menu is open, close it first then scroll after reflow.
  const scrollToSection = (id) => {
    if (menuOpen) {
      pendingScrollRef.current = id;
      setMenuOpen(false);
      return;
    }
    scrollToElement(id);
  };

  // After the menu animates closed, run the pending scroll.
  // setTimeout(0) waits for the DOM to repaint so getBoundingClientRect is accurate.
  useEffect(() => {
    if (menuOpen || !pendingScrollRef.current) return;
    const id = pendingScrollRef.current;
    pendingScrollRef.current = null;
    const timer = setTimeout(() => scrollToElement(id), 50);
    return () => clearTimeout(timer);
  }, [menuOpen]);
  // ──────────────────────────────────────────────────────────────────────────

  const startInterview = (role) => {
    const path = `/interview?role=${role}&difficulty=${selectedDifficulty}&ai=true`;
    if (!isAuthenticated) {
      navigate(`/auth?redirect=${encodeURIComponent(path)}`);
      return;
    }
    navigate(path);
  };

  const handleStartClick = () => {
    if (!isAuthenticated) {
      navigate("/auth?redirect=/#roles");
      return;
    }
    scrollToSection("roles");
  };

  return (
    <div style={s.page}>
      {/* AMBIENT BACKGROUND */}
      <div style={s.ambientTop} />
      <div style={s.ambientBottom} />
      <div style={s.grid} />

      {/* NAVBAR */}
      <nav ref={navRef} style={s.nav}>
        <div style={s.navInner}>
          <div style={s.navBrand}>
            <span style={s.navLogo}>▲</span>
            <span style={s.navName}>InterviewAI</span>
          </div>

          {/* Hamburger — mobile only */}
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            style={{
              ...s.hamburger,
              display: isSmall ? "flex" : "none",
            }}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>

          {/* Desktop links */}
          <div style={{ ...s.navLinks, display: isSmall ? "none" : "flex" }}>
            {["Features", "How It Works", "Reviews"].map((item) => (
              <button
                key={item}
                style={s.navLink}
                onClick={() => scrollToSection(item.toLowerCase().replace(/ /g, "-"))}
              >
                {item}
              </button>
            ))}
            <NavbarAuth styles={{
              linkBtn: s.navLink,
              outlineBtn: s.navOutlineBtn,
              userName: s.navUserName,
            }} />
            <button style={s.navCta} onClick={handleStartClick}>
              Start Interview
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && isSmall && (
          <div style={s.mobileMenu}>
            {["Features", "How It Works", "Reviews"].map((item) => (
              <button
                key={item}
                style={s.mobileMenuLink}
                onClick={() => scrollToSection(item.toLowerCase().replace(/ /g, "-"))}
              >
                {item}
              </button>
            ))}
            <NavbarAuth styles={{
              linkBtn: s.mobileMenuLink,
              outlineBtn: s.mobileMenuLink,
              userName: s.mobileMenuUser,
            }} />
            <button style={s.mobileMenuCta} onClick={handleStartClick}>
              Start Interview
            </button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <motion.section
        ref={heroRef}
        style={{
          ...s.hero,
          padding: isMobile ? "72px 20px 40px" : isTablet ? "88px 32px 48px" : s.hero.padding,
        }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div style={s.heroBadge}>
          <span style={s.heroBadgeDot} />
          AI Evaluation Active
        </div>

        <h1 style={{
          ...s.heroTitle,
          fontSize: isMobile ? "clamp(28px, 8vw, 40px)" : s.heroTitle.fontSize,
          letterSpacing: isMobile ? "-0.5px" : "-1.5px",
        }}>
          Practice interviews that<br />
          <span style={s.heroAccent}>think like your interviewer.</span>
        </h1>

        <p style={{
          ...s.heroSub,
          fontSize: isMobile ? "15px" : s.heroSub.fontSize,
          marginBottom: isMobile ? "28px" : s.heroSub.marginBottom ?? "36px",
        }}>
          Role-specific questions. Real-time AI scoring. Feedback that helps you
          understand exactly where you stand — before the real thing.
        </p>

        <div style={{
          ...s.heroActions,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          marginBottom: isMobile ? "40px" : "60px",
        }}>
          <button style={{
            ...s.heroPrimary,
            justifyContent: "center",
            width: isMobile ? "100%" : "auto",
          }} onClick={handleStartClick}>
            Start Practicing Free
            <span style={s.btnArrow}>→</span>
          </button>
          <button style={{
            ...s.heroSecondary,
            width: isMobile ? "100%" : "auto",
            textAlign: "center",
          }} onClick={() => scrollToSection("how-it-works")}>
            See How It Works
          </button>
        </div>

        {/* MINI SCORE PREVIEW */}
        <motion.div
          style={s.scorePreview}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div style={s.scorePreviewHeader}>
            <span style={s.scorePreviewLabel}>Live AI Evaluation</span>
            <span style={s.scorePreviewLive}>● LIVE</span>
          </div>
          <p style={s.scorePreviewQ}>"Explain the difference between authentication and authorization."</p>
          <div style={s.scorePreviewAnswer}>
            Authentication verifies who the user is. Authorization determines what they can access...
          </div>
          <div style={s.scorePreviewResult}>
            <div style={s.scoreBar}>
              <motion.div
                style={s.scoreBarFill}
                initial={{ width: 0 }}
                animate={{ width: "84%" }}
                transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
              />
            </div>
            <span style={s.scoreNum}>84%</span>
          </div>
          <p style={s.scorePreviewFeedback}>
            ✓ Core concepts correct. Consider adding concrete examples of each.
          </p>
        </motion.div>
      </motion.section>

      {/* STATS */}
      <section style={{
        ...s.statsRow,
        gridTemplateColumns: gridCols({ xs: 2, lg: 4 }, bp),
        margin: isMobile ? "0 16px 48px" : "0 auto 60px",
      }}>
        {displayStats.map(({ value, label }, i) => (
          <motion.div
            key={label}
            style={{
              ...s.statItem,
              padding: isMobile ? "20px 12px" : "32px 24px",
            }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <span style={{
              ...s.statValue,
              fontSize: isMobile ? "22px" : "28px",
            }}>{value}</span>
            <span style={s.statLabel}>{label}</span>
          </motion.div>
        ))}
      </section>

      <div style={s.divider} />

      {/* DIFFICULTY + ROLES */}
      {/* ↓ ID is on the outermost section element ↓ */}
      <section id="roles" style={{
        ...s.rolesSection,
        padding: isMobile ? "48px 20px" : isTablet ? "60px 32px" : s.rolesSection.padding,
      }}>
        <motion.div
          style={s.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 style={s.sectionTitle}>Configure Your Interview</h2>
          <p style={s.sectionSub}>Select your experience level and target role, then start immediately.</p>
        </motion.div>

        {/* DIFFICULTY */}
        <div style={{
          ...s.difficultyRow,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
        }}>
          <span style={s.configLabel}>Experience Level</span>
          <div style={{
            ...s.diffBtns,
            width: isMobile ? "100%" : "auto",
          }}>
            {DIFFICULTIES.map(({ id, label, color, desc }) => (
              <button
                key={id}
                style={{
                  ...s.diffBtn,
                  flex: isMobile ? "1 1 0" : "0 0 auto",
                  borderColor: selectedDifficulty === id ? color : "rgba(255,255,255,0.1)",
                  background: selectedDifficulty === id ? `${color}18` : "transparent",
                  color: selectedDifficulty === id ? color : "#94a3b8",
                }}
                onClick={() => setSelectedDifficulty(id)}
              >
                <span style={s.diffLabel}>{label}</span>
                <span style={s.diffDesc}>{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ROLES */}
        <div style={s.configLabel2}>Choose Your Role</div>
        <div style={{
          ...s.rolesGrid,
          gridTemplateColumns: gridCols({ xs: 1, lg: 2 }, bp),
        }}>
          {ROLES.map(({ id, label, icon, desc }, i) => (
            <motion.div
              key={id}
              style={{
                ...s.roleCard,
                borderColor: hoveredRole === id ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.08)",
                background: hoveredRole === id
                  ? "rgba(99,102,241,0.08)"
                  : "rgba(255,255,255,0.03)",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              onMouseEnter={() => setHoveredRole(id)}
              onMouseLeave={() => setHoveredRole(null)}
              onClick={() => startInterview(id)}
            >
              <div style={s.roleIcon}>{icon}</div>
              <div style={s.roleInfo}>
                <span style={s.roleLabel}>{label}</span>
                <span style={s.roleDesc}>{desc}</span>
              </div>
              <span style={{
                ...s.roleArrow,
                opacity: hoveredRole === id ? 1 : 0,
                transform: hoveredRole === id ? "translateX(0)" : "translateX(-8px)",
              }}>→</span>
            </motion.div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      {/* HOW IT WORKS */}
      {/* ↓ ID is on the outermost section element ↓ */}
      <section id="how-it-works" style={{
        ...s.howSection,
        padding: isMobile ? "48px 20px" : isTablet ? "60px 32px" : s.howSection.padding,
      }}>
        <motion.div
          style={s.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 style={s.sectionTitle}>How It Works</h2>
          <p style={s.sectionSub}>From zero to interview-ready in minutes.</p>
        </motion.div>

        <div style={s.steps}>
          {[
            { n: "01", title: "Pick Your Stack", desc: "Choose your role and experience level. Our AI generates questions specific to what you'll actually be asked." },
            { n: "02", title: "Answer Out Loud", desc: "Type your answers as you would in a real technical screen. No time pressure — think it through." },
            { n: "03", title: "Get Scored Instantly", desc: "Receive a score, specific feedback on what you missed, and a model answer to study." },
          ].map(({ n, title, desc }, i) => (
            <motion.div
              key={n}
              style={s.step}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <span style={s.stepNum}>{n}</span>
              <div>
                <h3 style={s.stepTitle}>{title}</h3>
                <p style={s.stepDesc}>{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      {/* FEATURES */}
      {/* ↓ ID is on the outermost section element ↓ */}
      <section id="features" style={{
        ...s.featuresSection,
        padding: isMobile ? "48px 20px" : isTablet ? "60px 32px" : s.featuresSection.padding,
      }}>
        <motion.div
          style={s.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 style={s.sectionTitle}>Built Different</h2>
          <p style={s.sectionSub}>Not another quiz app. A real interview simulator.</p>
        </motion.div>

        <div style={{
          ...s.featuresGrid,
          gridTemplateColumns: gridCols({ xs: 1, md: 2, lg: 3 }, bp),
        }}>
          {FEATURES.map(({ icon, title, desc }, i) => (
            <motion.div
              key={title}
              style={s.featureCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <span style={s.featureIcon}>{icon}</span>
              <h3 style={s.featureTitle}>{title}</h3>
              <p style={s.featureDesc}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      {/* REVIEWS */}
      {/* ↓ ID is on the outermost section element ↓ */}
      <section id="reviews" style={{
        ...s.reviewsSection,
        padding: isMobile ? "48px 20px" : isTablet ? "60px 32px" : s.reviewsSection.padding,
      }}>
        <motion.div
          style={s.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 style={s.sectionTitle}>What Candidates Say</h2>
        </motion.div>
        <div style={{
          ...s.reviewsGrid,
          gridTemplateColumns: gridCols({ xs: 1, md: 2, lg: 3 }, bp),
        }}>
          {[
            { text: "Felt like a real Google screen. The feedback was brutally honest in the best way.", name: "Sarah K.", role: "Frontend Engineer" },
            { text: "I failed my first real interview. Practiced here for two weeks, passed my second.", name: "Ali M.", role: "Backend Developer" },
            { text: "The AI actually catches when your answer has a factual error. It doesn't let you slide.", name: "John D.", role: "Fullstack Developer" },
          ].map(({ text, name, role }, i) => (
            <motion.div
              key={name}
              style={s.reviewCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p style={s.reviewText}>"{text}"</p>
              <div style={s.reviewAuthor}>
                <span style={s.reviewName}>{name}</span>
                <span style={s.reviewRole}>{role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        ...s.ctaSection,
        padding: isMobile ? "48px 20px" : s.ctaSection.padding,
      }}>
        <motion.div
          style={{
            ...s.ctaBox,
            padding: isMobile ? "40px 24px" : s.ctaBox.padding,
          }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 style={{
            ...s.ctaTitle,
            fontSize: isMobile ? "22px" : s.ctaTitle.fontSize,
          }}>Ready to find out where you stand?</h2>
          <p style={s.ctaSub}>Free to start. No credit card. Instant results.</p>
          <button style={{
            ...s.ctaBtn,
            width: isMobile ? "100%" : "auto",
          }} onClick={handleStartClick}>
            Begin Your Interview →
          </button>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={{
          ...s.footerInner,
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "12px" : 0,
          textAlign: isMobile ? "center" : "left",
        }}>
          <div style={s.footerBrand}>
            <span style={s.navLogo}>▲</span>
            <span style={s.navName}>InterviewAI</span>
          </div>
          <p style={s.footerCopy}>© 2026 InterviewAI. All rights reserved.</p>
        </div>
      </footer>
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
    background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  ambientBottom: {
    position: "fixed",
    bottom: "-200px",
    left: "-100px",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
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
    background: "rgba(8,12,20,0.85)",
    backdropFilter: "blur(16px)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  navInner: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "0 20px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  navLogo: {
    fontSize: "16px",
    color: "#6366f1",
  },
  navName: {
    fontSize: "15px",
    fontWeight: "700",
    letterSpacing: "-0.3px",
    color: "#f1f5f9",
  },
  navLinks: {
    alignItems: "center",
    gap: "4px",
  },
  navLink: {
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    padding: "6px 12px",
    borderRadius: "6px",
    transition: "color 0.2s",
  },
  navOutlineBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: "6px 14px",
    borderRadius: "8px",
    color: "#94a3b8",
    fontSize: "13px",
    cursor: "pointer",
  },
  navUserName: {
    color: "#94a3b8",
    fontSize: "13px",
  },
  navCta: {
    background: "#6366f1",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    color: "white",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    marginLeft: "8px",
  },
  hamburger: {
    background: "none",
    border: "none",
    color: "#f1f5f9",
    fontSize: "20px",
    cursor: "pointer",
    padding: "0",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "44px",
    minHeight: "44px",
    borderRadius: "8px",
  },

  // HERO
  hero: {
    maxWidth: "760px",
    margin: "0 auto",
    padding: "100px 24px 60px",
    textAlign: "center",
    position: "relative",
    zIndex: 1,
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(99,102,241,0.12)",
    border: "1px solid rgba(99,102,241,0.3)",
    borderRadius: "100px",
    padding: "4px 14px",
    fontSize: "12px",
    color: "#818cf8",
    fontWeight: "500",
    marginBottom: "32px",
  },
  heroBadgeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 6px #22c55e",
  },
  heroTitle: {
    fontSize: "clamp(36px, 6vw, 58px)",
    fontWeight: "800",
    lineHeight: "1.1",
    letterSpacing: "-1.5px",
    color: "#f8fafc",
    margin: "0 0 20px",
  },
  heroAccent: {
    background: "linear-gradient(135deg, #6366f1, #818cf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSub: {
    fontSize: "17px",
    color: "#64748b",
    lineHeight: "1.7",
    maxWidth: "540px",
    margin: "0 auto 36px",
  },
  heroActions: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "60px",
  },
  heroPrimary: {
    background: "#6366f1",
    border: "none",
    padding: "14px 28px",
    borderRadius: "10px",
    color: "white",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minHeight: "48px",
  },
  heroSecondary: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: "14px 28px",
    borderRadius: "10px",
    color: "#94a3b8",
    fontSize: "15px",
    cursor: "pointer",
    minHeight: "48px",
  },
  btnArrow: { fontSize: "16px" },

  // SCORE PREVIEW
  scorePreview: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "20px",
    textAlign: "left",
    backdropFilter: "blur(10px)",
    wordBreak: "break-word",
  },
  scorePreviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "16px",
    gap: "8px",
  },
  scorePreviewLabel: { fontSize: "12px", color: "#475569", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" },
  scorePreviewLive: { fontSize: "12px", color: "#22c55e", fontWeight: "600", flexShrink: 0 },
  scorePreviewQ: { fontSize: "14px", color: "#94a3b8", fontStyle: "italic", marginBottom: "12px" },
  scorePreviewAnswer: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "13px",
    color: "#cbd5e1",
    marginBottom: "16px",
  },
  scorePreviewResult: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  scoreBar: {
    flex: 1,
    height: "4px",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "2px",
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, #6366f1, #22c55e)",
    borderRadius: "2px",
  },
  scoreNum: { fontSize: "14px", fontWeight: "700", color: "#22c55e", flexShrink: 0 },
  scorePreviewFeedback: { fontSize: "13px", color: "#475569", margin: 0 },

  // STATS
  statsRow: {
    maxWidth: "900px",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    overflow: "hidden",
    position: "relative",
    zIndex: 1,
  },
  statItem: {
    padding: "32px 24px",
    background: "#080c14",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statValue: { fontSize: "28px", fontWeight: "800", color: "#f1f5f9", letterSpacing: "-1px" },
  statLabel: { fontSize: "12px", color: "#475569", fontWeight: "500" },

  divider: {
    height: "1px",
    background: "rgba(255,255,255,0.05)",
    maxWidth: "1100px",
    margin: "0 auto",
  },

  // ROLES
  rolesSection: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "80px 24px",
    position: "relative",
    zIndex: 1,
  },
  sectionHeader: {
    marginBottom: "48px",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: "clamp(24px, 5vw, 32px)",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    color: "#f1f5f9",
    margin: "0 0 12px",
  },
  sectionSub: {
    fontSize: "15px",
    color: "#475569",
    margin: 0,
  },
  difficultyRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "40px",
    flexWrap: "wrap",
  },
  configLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    whiteSpace: "nowrap",
  },
  configLabel2: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "16px",
  },
  diffBtns: {
    display: "flex",
    gap: "8px",
    flexWrap: "nowrap",
    flex: 1,
  },
  diffBtn: {
    background: "transparent",
    border: "1px solid",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "2px",
    transition: "all 0.2s",
    minHeight: "48px",
  },
  diffLabel: { fontSize: "13px", fontWeight: "600" },
  diffDesc: { fontSize: "11px", opacity: 0.7 },
  rolesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
  },
  roleCard: {
    border: "1px solid",
    borderRadius: "12px",
    padding: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    transition: "all 0.2s",
    minHeight: "72px",
  },
  roleIcon: {
    fontSize: "20px",
    color: "#6366f1",
    width: "32px",
    flexShrink: 0,
  },
  roleInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    minWidth: 0,
  },
  roleLabel: { fontSize: "15px", fontWeight: "700", color: "#f1f5f9" },
  roleDesc: { fontSize: "12px", color: "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  roleArrow: {
    fontSize: "16px",
    color: "#6366f1",
    transition: "all 0.2s",
    flexShrink: 0,
  },

  // HOW IT WORKS
  howSection: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "80px 24px",
    position: "relative",
    zIndex: 1,
  },
  steps: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  step: {
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
  },
  stepNum: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#6366f1",
    background: "rgba(99,102,241,0.1)",
    border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: "6px",
    padding: "4px 8px",
    flexShrink: 0,
    marginTop: "2px",
  },
  stepTitle: { fontSize: "17px", fontWeight: "700", color: "#f1f5f9", margin: "0 0 6px" },
  stepDesc: { fontSize: "14px", color: "#475569", margin: 0, lineHeight: "1.6" },

  // FEATURES
  featuresSection: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "80px 24px",
    position: "relative",
    zIndex: 1,
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
  },
  featureCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "24px 20px",
  },
  featureIcon: { fontSize: "20px", color: "#6366f1", display: "block", marginBottom: "16px" },
  featureTitle: { fontSize: "15px", fontWeight: "700", color: "#f1f5f9", margin: "0 0 8px" },
  featureDesc: { fontSize: "13px", color: "#475569", margin: 0, lineHeight: "1.6" },

  // REVIEWS
  reviewsSection: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "80px 24px",
    position: "relative",
    zIndex: 1,
  },
  reviewsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
  },
  reviewCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "24px",
  },
  reviewText: { fontSize: "14px", color: "#94a3b8", lineHeight: "1.7", margin: "0 0 20px", fontStyle: "italic" },
  reviewAuthor: { display: "flex", flexDirection: "column", gap: "2px" },
  reviewName: { fontSize: "13px", fontWeight: "700", color: "#f1f5f9" },
  reviewRole: { fontSize: "12px", color: "#475569" },

  // CTA
  ctaSection: {
    padding: "80px 24px",
    position: "relative",
    zIndex: 1,
  },
  ctaBox: {
    maxWidth: "600px",
    margin: "0 auto",
    textAlign: "center",
    background: "rgba(99,102,241,0.06)",
    border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: "20px",
    padding: "60px 40px",
  },
  ctaTitle: { fontSize: "28px", fontWeight: "800", color: "#f1f5f9", margin: "0 0 12px", letterSpacing: "-0.5px" },
  ctaSub: { fontSize: "14px", color: "#475569", margin: "0 0 32px" },
  ctaBtn: {
    background: "#6366f1",
    border: "none",
    padding: "14px 32px",
    borderRadius: "10px",
    color: "white",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    minHeight: "48px",
  },

  // FOOTER
  footer: {
    borderTop: "1px solid rgba(255,255,255,0.05)",
    padding: "32px 24px",
    position: "relative",
    zIndex: 1,
  },
  footerInner: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerBrand: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  footerCopy: { fontSize: "12px", color: "#334155", margin: 0 },
  mobileMenu: {
    display: "flex",
    flexDirection: "column",
    padding: "12px 20px 20px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    gap: "4px",
  },
  mobileMenuLink: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    padding: "12px 0",
    textAlign: "left",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    minHeight: "44px",
  },
  mobileMenuUser: {
    color: "#64748b",
    fontSize: "14px",
    padding: "12px 0",
  },
  mobileMenuCta: {
    background: "#6366f1",
    border: "none",
    padding: "14px 16px",
    borderRadius: "8px",
    color: "white",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
    minHeight: "48px",
  },
};
