# InterviewAI — Frontend

A React-based interview practice platform with real-time AI feedback, score tracking, and a fully responsive UI. This is the frontend client for the InterviewAI platform.

**Live Demo:** _(coming soon)_
**Backend Repo:** [interview-simulator-backend](https://github.com/samirajubaii/interview-simulator-backend)

## Features

- 🎯 **Role-Based Practice** — Choose from Frontend, Backend, Fullstack, or DevOps tracks at Junior, Mid-level, or Senior difficulty
- ⏱️ **Timed Interview Sessions** — Per-question countdown timers that mirror real interview pressure
- 🤖 **AI-Powered Feedback** — Instant scoring and detailed, actionable feedback on every answer
- 📊 **Performance Dashboard** — Score history chart, session averages, and trend tracking over time
- 🔍 **Session Review** — Expandable breakdowns of past interviews with model answers for comparison
- 📱 **Fully Responsive** — Tested and optimized across mobile (320px+), tablet, and desktop breakpoints
- ⚡ **Client-Side Caching** — Session storage caching for instant navigation between dashboard and session views
- 🔐 **Protected Routes** — Auth-gated pages with persistent login state

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 (Vite) |
| Routing | React Router v6 |
| Animation | Framer Motion |
| HTTP Client | Axios |
| State Management | React Context + Hooks |
| Styling | Inline styles with custom responsive breakpoint hook |

## Getting Started

### Prerequisites
- Node.js 18+
- The [backend API](https://github.com/samirajubaii/interview-simulator-backend) running locally or remotely

### Setup

1. **Clone the repository**
```bash
   git clone https://github.com/samirajubaii/interview-simulator-frontend.git
   cd interview-simulator-frontend
```

2. **Install dependencies**
```bash
   npm install
```

3. **Configure the API URL**

   Open `src/services/api.js` and confirm the `baseURL` points to your running backend (default: `http://127.0.0.1:8000/api`).

4. **Run the development server**
```bash
   npm run dev -- --host
```

5. Visit `http://localhost:5173`

## Project Structure

src/

├── components/      # Reusable UI pieces (NavbarAuth, InterviewCard, etc.)

├── context/          # AuthContext for global auth state

├── hooks/             # useInterviewSession, useBreakpoint

├── pages/             # Home, Interview, ReviewPage, Dashboard, ResultDetail, AuthPage

├── services/          # Axios API client

└── styles/            # Shared responsive CSS helpers

## Key Engineering Decisions

- **Custom `useBreakpoint` hook over CSS-in-JS media queries**: Since the project uses inline style objects (which don't support native `@media` queries), built a lightweight resize-listening hook to drive conditional layout logic across all pages.
- **Session-storage caching for navigation**: Dashboard and result-detail data is cached in `sessionStorage` on first load and explicitly invalidated when new data is saved, eliminating redundant API calls on back-and-forth navigation without needing a heavier state library.
- **Mobile-first interaction audit**: Every page was tested at 320px–1280px+ widths to catch issues like fixed-width grids, oversized tap targets, and sticky-nav scroll offset bugs — common gaps in AI-assisted layout generation.

## License

This project is open source and available for educational purposes.