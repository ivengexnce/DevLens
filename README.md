# 🔭 DevLens Pro — AI Developer Intelligence Platform

> Analyze GitHub profiles with AI scoring, contribution heatmaps, language analytics, and side-by-side developer comparison. Built for recruiters and developers.

## 🏗️ Tech Stack
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB (optional — app works without it)
- **APIs:** GitHub REST API + Anthropic Claude AI

---

## 🚀 Quick Start

### 1. Clone / extract and open terminal in the DevLens folder

### 2. Backend setup
```bash
cd backend
cp .env.example .env
# Edit .env and add your keys (see below)
npm install
npm run dev
# API runs on http://localhost:5000
```

### 3. Frontend setup (new terminal)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 🔑 Environment Variables

### backend/.env
| Variable | Required | Description |
|---|---|---|
| `GITHUB_TOKEN` | Recommended | GitHub Personal Access Token — increases rate limit from 60 to 5000 req/hr |
| `ANTHROPIC_API_KEY` | Optional | Enables Claude AI insights (falls back to rule-based if missing) |
| `MONGODB_URI` | Optional | MongoDB Atlas URI — enables leaderboard & trending |
| `PORT` | Optional | Default: 5000 |

### frontend/.env
| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `/api` | Backend API URL |

---

## 🔑 Getting API Keys

### GitHub Token (Free)
1. Go to https://github.com/settings/tokens
2. Click **Generate new token (classic)**
3. Select scopes: `read:user`, `public_repo`
4. Copy token → paste in `GITHUB_TOKEN`

### Anthropic API Key
1. Go to https://console.anthropic.com
2. Create API key → paste in `ANTHROPIC_API_KEY`

### MongoDB Atlas (Free tier)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster → get connection string
3. Paste in `MONGODB_URI`

---

## 📁 Project Structure

```
DevLens/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js      # MongoDB connection
│   │   │   └── github.js        # GitHub API client
│   │   ├── controllers/
│   │   │   ├── githubController.js  # Profile, compare, discover
│   │   │   ├── aiController.js      # Claude AI insights
│   │   │   └── analyticsController.js # Leaderboard
│   │   ├── middleware/
│   │   │   └── cache.js         # In-memory caching
│   │   ├── models/
│   │   │   └── Analytics.js     # MongoDB schema
│   │   ├── routes/
│   │   │   ├── github.js
│   │   │   ├── ai.js
│   │   │   └── analytics.js
│   │   ├── utils/
│   │   │   └── scoring.js       # AI scoring engine
│   │   └── server.js            # Express entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ScoreRing.jsx    # SVG score ring
    │   │   ├── Heatmap.jsx      # Contribution heatmap
    │   │   ├── LanguageBar.jsx  # Language distribution
    │   │   ├── RepoList.jsx     # Top repos
    │   │   ├── AIInsightCard.jsx
    │   │   ├── ScoreBreakdown.jsx
    │   │   └── StatCard.jsx
    │   ├── pages/
    │   │   ├── ProfilePage.jsx  # Main search page
    │   │   ├── ComparePage.jsx  # Side-by-side compare
    │   │   ├── DiscoverPage.jsx # Browse top devs
    │   │   └── LeaderboardPage.jsx
    │   ├── utils/
    │   │   ├── api.js           # Axios API client
    │   │   └── helpers.js       # Colors, formatters
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

---

## 🌟 Features
- **Profile Analysis** — Score, heatmap, language breakdown, top repos
- **AI Scoring** — 5-dimension algorithm (repos, stars, languages, followers, forks)
- **Claude AI Insights** — Recruiter-style developer assessment
- **Developer Comparison** — Head-to-head metric bars with AI verdict
- **Discover** — Browse top developers by language
- **Leaderboard** — Ranked database of analyzed developers (requires MongoDB)
- **Caching** — 5-min in-memory cache to minimize API calls

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd frontend && npm run build
# Deploy dist/ folder to Vercel
# Set VITE_API_URL=https://your-backend.render.com/api
```

### Backend → Render
- Connect GitHub repo
- Set environment variables in Render dashboard
- Build: `npm install` | Start: `npm start`
