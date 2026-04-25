import { useState } from 'react';
import { api } from '../utils/api';

/* ─── Constants ─── */
const LANG_COLORS = {
  JavaScript:'#f7df1e', TypeScript:'#3178c6', Python:'#3572A5', Go:'#00ADD8',
  Rust:'#dea584', Java:'#b07219','C++':'#f34b7d', Ruby:'#701516', Swift:'#F05138',
  Kotlin:'#A97BFF', Vue:'#41b883', CSS:'#563d7c', HTML:'#e34c26', Shell:'#89e051',
  Dart:'#00B4AB', Scala:'#c22d40', Elixir:'#6e4a7e', Haskell:'#5e5086',
};
const langColor = l => LANG_COLORS[l] || '#4a5568';

const scoreColor = s =>
  s >= 80 ? 'var(--emerald)' : s >= 60 ? 'var(--accent)' : s >= 40 ? 'var(--amber)' : 'var(--coral)';

const tierOf = s =>
  s >= 80 ? { label: 'Elite',        cls: 'rank-elite',        icon: '◈' } :
  s >= 60 ? { label: 'Advanced',     cls: 'rank-advanced',     icon: '◉' } :
  s >= 40 ? { label: 'Intermediate', cls: 'rank-intermediate', icon: '◎' } :
            { label: 'Beginner',     cls: 'rank-beginner',     icon: '○' };

const fmtNum = n => {
  if (!n && n !== 0) return '—';
  if (n >= 1000000) return `${(n/1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n/1000).toFixed(1)}k`;
  return String(n);
};

const DEMO_USERS = ['torvalds', 'gaearon', 'sindresorhus', 'yyx990803', 'tj'];

/* ─── ScoreRing ─── */
function ScoreRing({ score }) {
  const r = 54, circ = 2 * Math.PI * r;
  const color = scoreColor(score);
  const tier = tierOf(score);
  const pct = Math.round((score / 100) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.875rem' }}>
      <div style={{ position: 'relative', width: 140, height: 140 }}>
        {/* Outer glow ring */}
        <div style={{
          position: 'absolute', inset: -4,
          borderRadius: '50%',
          background: `conic-gradient(${color}25 ${pct * 3.6}deg, transparent ${pct * 3.6}deg)`,
          filter: 'blur(8px)',
        }}/>
        <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: 'relative', zIndex: 1 }}>
          <defs>
            <filter id="glow-ring">
              <feGaussianBlur stdDeviation="2.5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color}/>
              <stop offset="100%" stopColor={color} stopOpacity="0.6"/>
            </linearGradient>
          </defs>
          {/* Track */}
          <circle cx="70" cy="70" r={r} fill="none"
            stroke="rgba(255,255,255,0.05)" strokeWidth="10"/>
          {/* Progress */}
          <circle cx="70" cy="70" r={r} fill="none"
            stroke="url(#ringGrad)" strokeWidth="10"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - Math.min(score / 100, 1))}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
            className="score-ring-fill"
            filter="url(#glow-ring)"
          />
          {/* Score text */}
          <text x="70" y="65" textAnchor="middle" fill="var(--text)"
            fontSize="26" fontWeight="800" fontFamily="'Fira Code', monospace">
            {score}
          </text>
          <text x="70" y="81" textAnchor="middle" fill="var(--text-3)"
            fontSize="9" fontFamily="'Space Grotesk', sans-serif" letterSpacing="3">
            / 100
          </text>
        </svg>
      </div>
      <span className={`badge ${tier.cls}`} style={{ fontSize: '0.72rem', padding: '0.25rem 0.875rem', letterSpacing: '0.08em' }}>
        {tier.icon} {tier.label}
      </span>
    </div>
  );
}

/* ─── BreakdownBar ─── */
function BreakdownBar({ label, value, max, icon, delay = 0 }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = pct >= 70 ? 'var(--emerald)' : pct >= 45 ? 'var(--accent)' : pct >= 25 ? 'var(--amber)' : 'var(--text-3)';
  return (
    <div style={{ marginBottom: '1rem', animationDelay: `${delay}ms` }} className="slide-right">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ fontSize: '0.9rem' }}>{icon}</span> {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: '0.72rem', color }}>
            {value}<span style={{ color: 'var(--text-4)', fontSize: '0.65rem' }}>/{max}</span>
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-4)', fontFamily: "'Fira Code', monospace" }}>
            {Math.round(pct)}%
          </span>
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}60` }}/>
      </div>
    </div>
  );
}

/* ─── LangBar ─── */
function LangBar({ langs }) {
  if (!langs?.length) return null;
  return (
    <div>
      {/* Stacked bar */}
      <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', gap: 1, marginBottom: '1rem' }}>
        {langs.map(l => (
          <div key={l.name} style={{ flex: l.pct, background: langColor(l.name), transition: 'flex 0.5s ease' }}
            title={`${l.name} ${l.pct}%`}/>
        ))}
      </div>
      {/* Lang list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {langs.map((l, i) => (
          <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', animationDelay: `${i * 40}ms` }}
            className="slide-right">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: langColor(l.name), flexShrink: 0,
              boxShadow: `0 0 6px ${langColor(l.name)}80` }}/>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-2)', flex: 1, fontFamily: "'Space Grotesk', sans-serif" }}>{l.name}</span>
            <div style={{ flex: 2, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${l.pct}%`, height: '100%', background: langColor(l.name),
                borderRadius: 2, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)', boxShadow: `0 0 4px ${langColor(l.name)}60` }}/>
            </div>
            <span style={{ fontFamily: "'Fira Code', monospace", fontSize: '0.7rem', color: 'var(--text-3)', minWidth: 32, textAlign: 'right' }}>
              {l.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── StatChip ─── */
function StatChip({ icon, label, value, color }) {
  return (
    <div className="stat-chip slide-up">
      <div style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>{icon}</div>
      <div className="val" style={{ color: color || 'var(--text)' }}>{fmtNum(value)}</div>
      <div className="lbl">{label}</div>
    </div>
  );
}

/* ─── Skeleton ─── */
function Sk({ h = 14, w = '100%', style = {} }) {
  return <div className="skeleton" style={{ height: h, width: w, borderRadius: 6, ...style }}/>;
}

/* ─── Empty State ─── */
function EmptyState({ onDemo }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '5rem 2rem', textAlign: 'center',
    }}>
      {/* Grid bg decoration */}
      <div style={{
        width: 120, height: 120, marginBottom: '2rem', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(0,212,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
        }}/>
        <div style={{
          position: 'absolute', inset: '20%',
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: '50%',
          animation: 'float 3s ease-in-out infinite',
        }}/>
        <div style={{
          position: 'absolute', inset: '35%',
          border: '1px solid rgba(0,212,255,0.3)',
          borderRadius: '50%',
          animation: 'float 3s ease-in-out infinite 0.3s',
        }}/>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem',
        }}>
          🔭
        </div>
      </div>

      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.4rem', color: 'var(--text)', marginBottom: '0.625rem' }}>
        Analyze any GitHub developer
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', maxWidth: 380, lineHeight: 1.7, marginBottom: '2rem' }}>
        Enter a GitHub username to get a comprehensive developer score,
        AI-powered insights, language breakdown and repository analysis.
      </p>

      <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {DEMO_USERS.map(u => (
          <button key={u} onClick={() => onDemo(u)}
            style={{
              padding: '0.4rem 1rem', borderRadius: 100,
              background: 'var(--card-2)', border: '1px solid var(--border-2)',
              color: 'var(--text-2)', fontSize: '0.78rem',
              fontFamily: "'Fira Code', monospace", cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-2)'; }}>
            @{u}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── AI Panel ─── */
function AIPanel({ type, loading, content }) {
  const configs = {
    insights: { color: 'var(--accent)',  bg: 'rgba(0,212,255,0.04)',  border: 'rgba(0,212,255,0.15)',  label: '🤖 AI Recruiter Assessment' },
    career:   { color: 'var(--violet)',  bg: 'rgba(124,106,255,0.04)', border: 'rgba(124,106,255,0.15)', label: '💼 Career Intelligence' },
    roast:    { color: 'var(--coral)',   bg: 'rgba(255,95,126,0.04)',  border: 'rgba(255,95,126,0.15)', label: '🔥 Code Roast' },
  };
  const cfg = configs[type] || configs.insights;

  return (
    <div style={{
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: 12,
      padding: '1.125rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
        <span style={{ fontSize: '0.65rem', fontFamily: "'Fira Code', monospace", fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase', color: cfg.color }}>
          {cfg.label}
        </span>
        <div style={{ flex: 1, height: 1, background: `${cfg.border}` }}/>
        <span style={{
          fontSize: '0.6rem', padding: '0.15rem 0.5rem', borderRadius: 100,
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          color: cfg.color, fontFamily: "'Fira Code', monospace",
        }}>
          Claude AI
        </span>
      </div>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[100, 90, 82, 70, 55].map((w, i) => (
            <Sk key={i} h={11} w={`${w}%`}/>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: '0.84rem', color: 'var(--text-2)', lineHeight: 1.8, whiteSpace: 'pre-wrap',
          fontFamily: "'Space Grotesk', sans-serif" }}>
          {content}
        </p>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function ProfilePage() {
  const [query,    setQuery]    = useState('');
  const [profile,  setProfile]  = useState(null);
  const [score,    setScore]    = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [repos,    setRepos]    = useState([]);
  const [langs,    setLangs]    = useState([]);
  const [insight,  setInsight]  = useState('');
  const [insightType, setInsightType] = useState('');
  const [insightLoading, setInsightLoading] = useState(false);
  const [tab,      setTab]      = useState('overview');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  /* ── Stats derived from repos ── */
  const totalStars   = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
  const totalForks   = repos.reduce((s, r) => s + (r.forks_count || 0), 0);
  const originalRepos = repos.filter(r => !r.fork).length;
  const avgStars     = originalRepos ? Math.round(totalStars / originalRepos) : 0;

  async function fetchProfile(q) {
    const username = (q || query).trim();
    if (!username) return;
    setLoading(true); setError('');
    setProfile(null); setScore(null); setBreakdown(null);
    setRepos([]); setLangs([]); setInsight(''); setInsightType('');
    setTab('overview');
    try {
      const [p, s, r] = await Promise.all([
        api.getProfile(username),
        api.getScore(username),
        api.getRepos(username),
      ]);
      setProfile(p);
      setScore(s.score ?? s);
      setBreakdown(s.breakdown || null);

      const langMap = {};
      (r || []).forEach(repo => {
        if (repo.language) langMap[repo.language] = (langMap[repo.language] || 0) + 1;
      });
      const total = Object.values(langMap).reduce((a, b) => a + b, 0);
      const sorted = Object.entries(langMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
      setLangs(sorted.map(([name, cnt]) => ({ name, pct: Math.round((cnt / total) * 100) })));
      setRepos((r || []).sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0)).slice(0, 10));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadInsight(type) {
    if (!profile) return;
    setInsightType(type);
    setTab(type);
    if (insightType === type && insight) return;
    setInsightLoading(true); setInsight('');
    try {
      const d = await api.getInsights(profile.login, type);
      setInsight(d.insight || d.message || d);
    } catch (e) {
      setInsight('Failed to generate AI insight. Please try again.');
    } finally {
      setInsightLoading(false);
    }
  }

  const handleSubmit = (e) => {
    e?.preventDefault();
    fetchProfile();
  };

  const TABS = [
    { id: 'overview', label: 'Overview',   icon: '◉' },
    { id: 'repos',    label: 'Repos',      icon: '⬚' },
    { id: 'insights', label: 'AI Insight', icon: '✦' },
    { id: 'career',   label: 'Career',     icon: '◈' },
    { id: 'roast',    label: 'Roast',      icon: '⚡' },
  ];

  return (
    <div className="fade-in" style={{ maxWidth: 1120, margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* ══ SEARCH BAR ══ */}
      <div style={{ marginBottom: profile ? '1.5rem' : 0 }}>
        {!profile && !loading && (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.3rem 0.875rem', borderRadius: 100,
              background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
              marginBottom: '1.25rem',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'block', boxShadow: '0 0 6px var(--accent)' }}/>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontFamily: "'Fira Code', monospace", letterSpacing: '0.1em', fontWeight: 600 }}>
                GITHUB DEVELOPER ANALYTICS
              </span>
            </div>
            <h1 style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3rem)',
              color: 'var(--text)', lineHeight: 1.15, letterSpacing: '-0.03em',
              marginBottom: '0.75rem',
            }}>
              Understand any developer<br/>
              <span style={{ color: 'var(--accent)' }}>at a glance.</span>
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-3)', maxWidth: 480, margin: '0 auto' }}>
              AI-powered scoring, contribution analysis, and career insights for GitHub profiles.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{
          display: 'flex', gap: '0.625rem',
          maxWidth: profile ? '100%' : 560,
          margin: profile ? 0 : '0 auto',
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{
              position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-3)', fontSize: '0.85rem', pointerEvents: 'none',
              fontFamily: "'Fira Code', monospace",
            }}>
              @
            </span>
            <input
              className="input"
              style={{ paddingLeft: '2rem' }}
              type="text"
              placeholder="username"
              value={query}
              onChange={e => setQuery(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading || !query.trim()}>
            {loading ? (
              <>
                <div className="loading-dots" style={{ gap: 3 }}>
                  <span/><span/><span/>
                </div>
                Analyzing
              </>
            ) : 'Analyze →'}
          </button>
          {!profile && (
            <button type="button" className="btn btn-secondary"
              onClick={() => {
                const u = DEMO_USERS[Math.floor(Math.random() * DEMO_USERS.length)];
                setQuery(u); fetchProfile(u);
              }}
              disabled={loading}>
              Demo
            </button>
          )}
        </form>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: '0.875rem', padding: '0.75rem 1rem',
            background: 'var(--coral-dim)', border: '1px solid rgba(255,95,126,0.2)',
            borderRadius: 10, fontSize: '0.82rem', color: 'var(--coral)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <span>⚠</span>
            <div>
              <span style={{ fontWeight: 600 }}>{error}</span>
              <span style={{ color: 'var(--text-3)', marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                Check the username or GitHub API limits.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ══ LOADING SKELETON ══ */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card profile-hero" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <Sk h={80} w={80} style={{ borderRadius: '50%' }}/>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <Sk h={20} w="45%"/>
                  <Sk h={12} w="30%"/>
                  <Sk h={12} w="70%"/>
                </div>
              </div>
            </div>
            <div className="card">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.625rem' }}>
                {[...Array(4)].map((_, i) => <Sk key={i} h={72} w="100%"/>)}
              </div>
            </div>
            <div className="card">
              {[...Array(5)].map((_, i) => <Sk key={i} h={12} w={`${95 - i * 8}%`} style={{ marginBottom: '0.75rem' }}/>)}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
              <Sk h={140} w={140} style={{ borderRadius: '50%' }}/>
              <Sk h={16} w="70%"/>
            </div>
            <div className="card">
              {[...Array(5)].map((_, i) => <Sk key={i} h={12} w="100%" style={{ marginBottom: '0.75rem' }}/>)}
            </div>
          </div>
        </div>
      )}

      {/* ══ EMPTY STATE ══ */}
      {!profile && !loading && !error && (
        <EmptyState onDemo={(u) => { setQuery(u); fetchProfile(u); }}/>
      )}

      {/* ══ PROFILE CONTENT ══ */}
      {profile && !loading && (
        <div className="slide-up" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem', alignItems: 'start' }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* ── Profile Hero ── */}
            <div className="card profile-hero" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img src={profile.avatar_url} alt={profile.login}
                    style={{
                      width: 84, height: 84, borderRadius: 16,
                      border: '2px solid var(--border-accent)',
                      boxShadow: '0 0 20px var(--accent-dim)',
                    }}/>
                  {/* Online indicator */}
                  <div style={{
                    position: 'absolute', bottom: 4, right: 4,
                    width: 12, height: 12, borderRadius: '50%',
                    background: 'var(--emerald)', border: '2px solid var(--card)',
                    boxShadow: '0 0 6px var(--emerald)',
                  }}/>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                    <h2 style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 800, fontSize: '1.35rem',
                      color: 'var(--text)', letterSpacing: '-0.02em',
                    }}>
                      {profile.name || profile.login}
                    </h2>
                    {score !== null && (
                      <span className={`badge ${tierOf(score).cls}`} style={{ fontSize: '0.65rem' }}>
                        {tierOf(score).icon} {tierOf(score).label}
                      </span>
                    )}
                  </div>

                  <a href={`https://github.com/${profile.login}`} target="_blank" rel="noreferrer"
                    style={{
                      fontFamily: "'Fira Code', monospace",
                      fontSize: '0.82rem', color: 'var(--accent)',
                      textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                      marginBottom: '0.625rem',
                    }}>
                    ⬡ github.com/{profile.login}
                  </a>

                  {profile.bio && (
                    <p style={{ fontSize: '0.83rem', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: '0.75rem', maxWidth: 480 }}>
                      {profile.bio}
                    </p>
                  )}

                  {/* Meta row */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    {[
                      profile.location && { icon: '◌', val: profile.location },
                      profile.company  && { icon: '⊡', val: profile.company  },
                      profile.blog     && { icon: '⊘', val: profile.blog, href: profile.blog },
                    ].filter(Boolean).map((m, i) => (
                      m.href ? (
                        <a key={i} href={m.href} target="_blank" rel="noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem',
                            color: 'var(--accent)', textDecoration: 'none' }}>
                          {m.icon} {m.val}
                        </a>
                      ) : (
                        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem',
                          fontSize: '0.78rem', color: 'var(--text-3)' }}>
                          {m.icon} {m.val}
                        </span>
                      )
                    ))}
                    {profile.created_at && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-3)' }}>
                        ◷ Joined {new Date(profile.created_at).getFullYear()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.45rem 0.875rem' }}
                    onClick={() => { setQuery(''); setProfile(null); }}>
                    ← Back
                  </button>
                  <a href={`https://github.com/${profile.login}`} target="_blank" rel="noreferrer"
                    className="btn btn-primary" style={{ fontSize: '0.78rem', padding: '0.45rem 0.875rem', textDecoration: 'none' }}>
                    GitHub ↗
                  </a>
                </div>
              </div>
            </div>

            {/* ── Stat Chips ── */}
            <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.625rem' }}>
              <StatChip icon="📦" label="Repositories" value={profile.public_repos} color="var(--accent)"/>
              <StatChip icon="👥" label="Followers"    value={profile.followers}    color="var(--violet)"/>
              <StatChip icon="➡"  label="Following"    value={profile.following}     />
              <StatChip icon="⭐" label="Total Stars"  value={totalStars}           color="var(--amber)"/>
            </div>

            {/* ── Tabs Card ── */}
            <div className="card" style={{ padding: '1rem' }}>
              <div className="tab-bar">
                {TABS.map(t => (
                  <button key={t.id}
                    className={`tab ${tab === t.id ? 'active' : ''}`}
                    onClick={() => {
                      if (t.id === 'insights') loadInsight('insights');
                      else if (t.id === 'career') loadInsight('career');
                      else if (t.id === 'roast') loadInsight('roast');
                      else setTab(t.id);
                    }}>
                    <span style={{ marginRight: '0.3rem', opacity: 0.8 }}>{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>

              {/* ── Overview ── */}
              {tab === 'overview' && (
                <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  {/* Activity stats */}
                  <div>
                    <div className="section-label">Activity Stats</div>
                    {[
                      { icon: '⭐', label: 'Total Stars',     value: totalStars    },
                      { icon: '🍴', label: 'Total Forks',     value: totalForks    },
                      { icon: '📦', label: 'Original Repos',  value: originalRepos },
                      { icon: '📊', label: 'Avg Stars / Repo',value: avgStars      },
                      { icon: '📝', label: 'Public Gists',    value: profile.public_gists },
                    ].map((s, i) => (
                      <div key={s.label} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.55rem 0',
                        borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
                      }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{s.icon} {s.label}</span>
                        <span style={{ fontFamily: "'Fira Code', monospace", fontSize: '0.85rem', color: 'var(--text)', fontWeight: 700 }}>
                          {fmtNum(s.value)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Languages */}
                  <div>
                    <div className="section-label">Language Distribution</div>
                    <LangBar langs={langs}/>
                  </div>
                </div>
              )}

              {/* ── Repos ── */}
              {tab === 'repos' && (
                <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {repos.map((r, i) => (
                    <a key={r.id} href={r.html_url} target="_blank" rel="noreferrer"
                      className="repo-card"
                      style={{ animationDelay: `${i * 30}ms` }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 3 }}>
                            {r.fork && (
                              <span style={{ fontSize: '0.58rem', color: 'var(--text-3)',
                                border: '1px solid var(--border-2)', borderRadius: 4, padding: '1px 5px',
                                fontFamily: "'Fira Code', monospace" }}>fork</span>
                            )}
                            <span style={{ fontSize: '0.88rem', fontWeight: 700,
                              color: 'var(--accent)', fontFamily: "'Fira Code', monospace",
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {r.name}
                            </span>
                          </div>
                          {r.description && (
                            <p style={{ fontSize: '0.73rem', color: 'var(--text-3)',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 360 }}>
                              {r.description}
                            </p>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                          {r.language && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--text-3)' }}>
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: langColor(r.language),
                                display: 'inline-block', boxShadow: `0 0 4px ${langColor(r.language)}80` }}/>
                              {r.language}
                            </span>
                          )}
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'Fira Code', monospace" }}>
                            ⭐ {fmtNum(r.stargazers_count)}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'Fira Code', monospace" }}>
                            🍴 {fmtNum(r.forks_count)}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {/* ── AI Tabs ── */}
              {(tab === 'insights' || tab === 'career' || tab === 'roast') && (
                <div className="fade-in">
                  <AIPanel type={tab} loading={insightLoading} content={insight}/>
                </div>
              )}
            </div>

            {/* ── Language Card (expanded view) ── */}
            {langs.length > 0 && tab === 'overview' && (
              <div className="card">
                <div className="section-label">Tech Stack</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {langs.map(l => (
                    <div key={l.name} style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      padding: '0.35rem 0.75rem', borderRadius: 100,
                      background: `${langColor(l.name)}15`, border: `1px solid ${langColor(l.name)}30`,
                    }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: langColor(l.name),
                        boxShadow: `0 0 6px ${langColor(l.name)}80`, display: 'block' }}/>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-2)', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}>
                        {l.name}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'Fira Code', monospace" }}>
                        {l.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: 76 }}>

            {/* Score card */}
            <div className="card-accent" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.75rem 1.25rem' }}>
              <div className="section-label" style={{ marginBottom: 0 }}>Developer Score</div>
              {score !== null && <ScoreRing score={score}/>}

              {/* Mini stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', width: '100%' }}>
                {[
                  { l: 'Repos',     v: profile.public_repos },
                  { l: 'Followers', v: profile.followers    },
                ].map(s => (
                  <div key={s.l} style={{
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '0.65rem', textAlign: 'center',
                  }}>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>
                      {fmtNum(s.v)}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Breakdown */}
            {breakdown && (
              <div className="card">
                <div className="section-label">Score Breakdown</div>
                <BreakdownBar label="Repositories"  icon="📁" value={breakdown.repos      ?? 0} max={30} delay={0}/>
                <BreakdownBar label="Star Velocity"  icon="⭐" value={breakdown.stars      ?? 0} max={30} delay={50}/>
                <BreakdownBar label="Tech Diversity" icon="💻" value={breakdown.languages  ?? 0} max={20} delay={100}/>
                <BreakdownBar label="Community"      icon="👥" value={breakdown.followers  ?? 0} max={10} delay={150}/>
                <BreakdownBar label="Fork Adoption"  icon="🍴" value={breakdown.forks      ?? 0} max={10} delay={200}/>
              </div>
            )}

            {/* Language sidebar */}
            {langs.length > 0 && (
              <div className="card">
                <div className="section-label">Languages</div>
                <LangBar langs={langs}/>
              </div>
            )}

            {/* Quick actions */}
            <div className="card" style={{ padding: '1rem' }}>
              <div className="section-label">Quick Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { label: '✦ AI Insight',  action: () => loadInsight('insights'), color: 'var(--accent)' },
                  { label: '◈ Career Tips', action: () => loadInsight('career'),   color: 'var(--violet)' },
                  { label: '⚡ Roast Me',   action: () => loadInsight('roast'),    color: 'var(--coral)'  },
                ].map(a => (
                  <button key={a.label} onClick={a.action}
                    style={{
                      width: '100%', padding: '0.6rem 1rem', borderRadius: 8,
                      background: 'var(--card-2)', border: '1px solid var(--border)',
                      color: a.color, fontSize: '0.8rem', fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = a.color + '40'; e.currentTarget.style.background = a.color + '0a'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--card-2)'; }}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}