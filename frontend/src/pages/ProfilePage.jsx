import { useState } from 'react';
import { api } from '../utils/api';

/* ─── helpers ─── */
const LANG_COLORS = {
  JavaScript:'#f7df1e', TypeScript:'#3178c6', Python:'#3572A5', Go:'#00ADD8',
  Rust:'#dea584', Java:'#b07219','C++':'#f34b7d', Ruby:'#701516', Swift:'#F05138',
  Kotlin:'#A97BFF', Vue:'#41b883', CSS:'#563d7c', HTML:'#e34c26', Shell:'#89e051',
};
const langColor = l => LANG_COLORS[l] || '#6b7280';

const scoreColor = s =>
  s >= 80 ? 'var(--accent)' : s >= 60 ? 'var(--info)' : s >= 40 ? 'var(--gold)' : 'var(--accent3)';

const tierOf = s =>
  s >= 80 ? { label: 'Elite',        cls: 'rank-elite'        } :
  s >= 60 ? { label: 'Advanced',     cls: 'rank-advanced'     } :
  s >= 40 ? { label: 'Intermediate', cls: 'rank-intermediate' } :
            { label: 'Beginner',     cls: 'rank-beginner'     };

const fmtNum = n => {
  if (!n && n !== 0) return '—';
  if (n >= 1000) return `${(n/1000).toFixed(1)}k`;
  return String(n);
};

/* ─── ScoreRing ─── */
function ScoreRing({ score }) {
  const r = 52, circ = 2 * Math.PI * r;
  const color = scoreColor(score);
  const tier  = tierOf(score);
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.5rem' }}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <circle cx="65" cy="65" r={r} fill="none" stroke="var(--border)" strokeWidth="10"/>
        <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - Math.min(score/100,1))}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
          className="score-ring-fill"
          filter="url(#glow)"
          style={{ transition:'stroke-dashoffset 1s cubic-bezier(.34,1.2,.64,1)' }}
        />
        <text x="65" y="62" textAnchor="middle" fill="white" fontSize="24" fontWeight="800"
          fontFamily="JetBrains Mono,monospace">{score}</text>
        <text x="65" y="78" textAnchor="middle" fill="var(--muted)" fontSize="9"
          fontFamily="Syne,sans-serif" letterSpacing="2">/100</text>
      </svg>
      <span className={`badge ${tier.cls}`} style={{ fontSize:'0.7rem', padding:'0.25rem 0.75rem' }}>
        {tier.label}
      </span>
    </div>
  );
}

/* ─── StatChip ─── */
function StatChip({ icon, label, value }) {
  return (
    <div style={{
      background:'var(--card2)', border:'1px solid var(--border)',
      borderRadius: 10, padding:'0.75rem', textAlign:'center', minWidth: 80,
    }}>
      <div style={{ fontSize:'1rem', marginBottom:'0.2rem' }}>{icon}</div>
      <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'1.05rem', fontWeight:700, color:'var(--text)' }}>
        {fmtNum(value)}
      </div>
      <div style={{ fontSize:'0.62rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:2 }}>
        {label}
      </div>
    </div>
  );
}

/* ─── BreakdownBar ─── */
function BreakdownBar({ label, value, max, icon }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = pct >= 70 ? 'var(--accent)' : pct >= 40 ? 'var(--info)' : pct >= 20 ? 'var(--gold)' : 'var(--muted)';
  return (
    <div style={{ marginBottom:'0.75rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.3rem' }}>
        <span style={{ fontSize:'0.8rem', color:'var(--text2)' }}>{icon} {label}</span>
        <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.75rem', color }}>{value}/{max}</span>
      </div>
      <div style={{ height:5, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:3,
          transition:'width 0.8s ease', boxShadow:`0 0 6px ${color}66` }}/>
      </div>
    </div>
  );
}

/* ─── LangBar ─── */
function LangBar({ langs }) {
  if (!langs?.length) return null;
  return (
    <div>
      <div style={{ display:'flex', height:8, borderRadius:4, overflow:'hidden', gap:1, marginBottom:'0.875rem' }}>
        {langs.map(l => (
          <div key={l.name} style={{ flex:l.pct, background:langColor(l.name) }} title={`${l.name} ${l.pct}%`}/>
        ))}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
        {langs.map(l => (
          <div key={l.name} style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:langColor(l.name), flexShrink:0 }}/>
            <span style={{ fontSize:'0.78rem', color:'var(--text2)', flex:1 }}>{l.name}</span>
            <div style={{ flex:2, height:3, background:'var(--border)', borderRadius:2 }}>
              <div style={{ width:`${l.pct}%`, height:'100%', background:langColor(l.name), borderRadius:2 }}/>
            </div>
            <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.7rem', color:'var(--muted)', minWidth:32, textAlign:'right' }}>{l.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Skeleton ─── */
function Skeleton({ h = 14, w = '100%', style = {} }) {
  return <div className="skeleton" style={{ height: h, width: w, ...style }}/>;
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
  const [insightLoading, setInsightLoading] = useState(false);
  const [tab,      setTab]      = useState('overview');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleSearch(e) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true); setError(''); setProfile(null); setScore(null);
    setBreakdown(null); setRepos([]); setLangs([]); setInsight(''); setTab('overview');
    try {
      const [p, s, r] = await Promise.all([
        api.getProfile(q),
        api.getScore(q),
        api.getRepos(q),
      ]);
      setProfile(p);
      setScore(s.score ?? s);
      setBreakdown(s.breakdown || null);

      // compute languages from repos
      const langMap = {};
      (r || []).forEach(repo => {
        if (repo.language) langMap[repo.language] = (langMap[repo.language] || 0) + 1;
      });
      const total = Object.values(langMap).reduce((a,b) => a+b, 0);
      const sorted = Object.entries(langMap)
        .sort((a,b) => b[1]-a[1])
        .slice(0,6)
        .map(([name, cnt]) => ({ name, pct: Math.round((cnt/total)*100) }));
      setLangs(sorted);
      setRepos((r || []).sort((a,b) => b.stargazers_count - a.stargazers_count).slice(0,10));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function loadInsight(type = 'insight') {
    setTab('insights'); setInsight(''); setInsightLoading(true);
    try {
      const d = await api.getInsights(query.trim(), type);
      setInsight(d.insights || d.insight || 'No insight available.');
    } catch { setInsight('Failed to load AI insights.'); }
    finally { setInsightLoading(false); }
  }

  const totalStars    = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
  const totalForks    = repos.reduce((s, r) => s + (r.forks_count || 0), 0);
  const originalRepos = repos.filter(r => !r.fork).length;
  const avgStars      = repos.length ? (totalStars / repos.length).toFixed(1) : 0;

  return (
    <div className="fade-in" style={{ maxWidth:1100, margin:'0 auto', padding:'1.5rem 1.25rem' }}>

      {/* Search bar */}
      <div className="card" style={{ marginBottom:'1.25rem' }}>
        <div style={{ fontSize:'0.65rem', fontFamily:'JetBrains Mono,monospace', color:'var(--muted)',
          letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'0.75rem' }}>
          ◎ GitHub Profile Analyzer
        </div>
        <form onSubmit={handleSearch} style={{ display:'flex', gap:'0.625rem' }}>
          <input className="input" style={{ flex:1 }} placeholder="Enter GitHub username…"
            value={query} onChange={e => setQuery(e.target.value)} autoFocus />
          <button className="btn btn-primary" type="submit" disabled={loading || !query.trim()}>
            {loading
              ? <><span className="w-3 h-3 spin" style={{ display:'inline-block', width:12, height:12, border:'2px solid #000', borderTopColor:'transparent', borderRadius:'50%' }}/> Analyzing</>
              : 'Analyze'}
          </button>
          <button type="button" className="btn btn-secondary" disabled={loading}
            onClick={() => { setQuery(['torvalds','gaearon','sindresorhus','yyx990803','tj'][Math.floor(Math.random()*5)]); setTimeout(handleSearch, 50); }}>
            Demo
          </button>
        </form>
        {error && (
          <div style={{ marginTop:'0.75rem', padding:'0.625rem 0.875rem', background:'rgba(255,95,126,0.08)',
            border:'1px solid rgba(255,95,126,0.25)', borderRadius:8, fontSize:'0.82rem', color:'var(--accent3)' }}>
            {error}
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'1rem' }}>
          <div className="card" style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            <div style={{ display:'flex', gap:'1rem', alignItems:'flex-start' }}>
              <Skeleton h={80} w={80} style={{ borderRadius:'50%' }}/>
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                <Skeleton h={22} w="55%"/><Skeleton h={14} w="35%"/><Skeleton h={12} w="75%"/>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.5rem' }}>
              {[...Array(4)].map((_,i) => <Skeleton key={i} h={64}/>)}
            </div>
          </div>
          <div className="card"><Skeleton h={200}/></div>
        </div>
      )}

      {/* Profile content */}
      {profile && !loading && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'1rem', alignItems:'start' }}>

          {/* LEFT COLUMN */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

            {/* Profile header card */}
            <div className="card slide-up" style={{ display:'flex', gap:'1.25rem', alignItems:'flex-start' }}>
              <div style={{ position:'relative', flexShrink:0 }}>
                <img src={profile.avatar_url} alt={profile.login}
                  style={{ width:80, height:80, borderRadius:'50%', border:'2px solid var(--border2)', display:'block' }}/>
                <div style={{ position:'absolute', bottom:-2, right:-2, width:18, height:18,
                  background:'var(--accent)', borderRadius:'50%', border:'2px solid var(--bg)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.55rem' }}>✓</div>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <h2 style={{ fontSize:'1.25rem', fontWeight:800, color:'var(--text)', marginBottom:2 }}>
                  {profile.name || profile.login}
                </h2>
                <a href={`https://github.com/${profile.login}`} target="_blank" rel="noreferrer"
                  style={{ fontSize:'0.82rem', color:'var(--accent)', textDecoration:'none',
                    fontFamily:'JetBrains Mono,monospace', marginBottom:'0.5rem', display:'block' }}>
                  @{profile.login}
                </a>
                {profile.bio && (
                  <p style={{ fontSize:'0.82rem', color:'var(--text2)', marginBottom:'0.6rem', lineHeight:1.5 }}>
                    {profile.bio}
                  </p>
                )}
                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.625rem' }}>
                  {profile.location && <span style={{ fontSize:'0.75rem', color:'var(--muted)' }}>📍 {profile.location}</span>}
                  {profile.company  && <span style={{ fontSize:'0.75rem', color:'var(--muted)' }}>🏢 {profile.company}</span>}
                  {profile.blog     && <a href={profile.blog} target="_blank" rel="noreferrer"
                    style={{ fontSize:'0.75rem', color:'var(--info)', textDecoration:'none' }}>🔗 Website</a>}
                  {profile.twitter_username && <span style={{ fontSize:'0.75rem', color:'var(--muted)' }}>𝕏 @{profile.twitter_username}</span>}
                  {profile.created_at && <span style={{ fontSize:'0.75rem', color:'var(--muted)' }}>
                    📅 Joined {new Date(profile.created_at).getFullYear()}
                  </span>}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.625rem' }}>
              <StatChip icon="📦" label="Repos"     value={profile.public_repos}  />
              <StatChip icon="👥" label="Followers"  value={profile.followers}     />
              <StatChip icon="➡️"  label="Following"  value={profile.following}     />
              <StatChip icon="📝" label="Gists"      value={profile.public_gists}  />
            </div>

            {/* Tabs */}
            <div className="card" style={{ padding:'1rem' }}>
              <div className="tab-bar">
                {[
                  { id:'overview', label:'◉ Overview' },
                  { id:'repos',    label:'📁 Repos'   },
                  { id:'insights', label:'🧠 AI Insight'},
                  { id:'career',   label:'💼 Career'  },
                  { id:'roast',    label:'🔥 Roast'   },
                ].map(t => (
                  <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`}
                    onClick={() => {
                      if (t.id === 'insights') loadInsight('insight');
                      else if (t.id === 'career') loadInsight('career');
                      else if (t.id === 'roast')  loadInsight('roast');
                      else setTab(t.id);
                    }}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Overview tab */}
              {tab === 'overview' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                  {/* Quick stats */}
                  <div>
                    <div className="section-label">Activity Stats</div>
                    {[
                      { icon:'⭐', label:'Total Stars',    value: totalStars   },
                      { icon:'🍴', label:'Total Forks',    value: totalForks   },
                      { icon:'📦', label:'Original Repos', value: originalRepos},
                      { icon:'📊', label:'Avg Stars/Repo', value: avgStars     },
                    ].map(s => (
                      <div key={s.label} style={{ display:'flex', justifyContent:'space-between',
                        alignItems:'center', padding:'0.5rem 0', borderBottom:'1px solid var(--border)' }}>
                        <span style={{ fontSize:'0.8rem', color:'var(--text2)' }}>{s.icon} {s.label}</span>
                        <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.85rem', color:'var(--text)', fontWeight:700 }}>
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

              {/* Repos tab */}
              {tab === 'repos' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                  {repos.map(r => (
                    <a key={r.id} href={r.html_url} target="_blank" rel="noreferrer"
                      style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                        padding:'0.7rem 0.875rem', background:'var(--card2)', borderRadius:8,
                        border:'1px solid var(--border)', textDecoration:'none',
                        transition:'border-color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor='var(--border2)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
                      <div style={{ minWidth:0, flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', marginBottom:2 }}>
                          {r.fork && <span style={{ fontSize:'0.6rem', color:'var(--muted)', border:'1px solid var(--border)', borderRadius:3, padding:'1px 4px' }}>fork</span>}
                          <span style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--info)',
                            fontFamily:'JetBrains Mono,monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {r.name}
                          </span>
                        </div>
                        {r.description && <p style={{ fontSize:'0.72rem', color:'var(--muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:320 }}>{r.description}</p>}
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexShrink:0, marginLeft:'0.75rem' }}>
                        {r.language && (
                          <span style={{ display:'flex', alignItems:'center', gap:3, fontSize:'0.7rem', color:'var(--muted)' }}>
                            <span style={{ width:6, height:6, borderRadius:'50%', background:langColor(r.language), display:'inline-block' }}/>
                            {r.language}
                          </span>
                        )}
                        <span style={{ fontSize:'0.72rem', color:'var(--muted)' }}>⭐ {r.stargazers_count}</span>
                        <span style={{ fontSize:'0.72rem', color:'var(--muted)' }}>🍴 {r.forks_count}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {/* AI tabs */}
              {(tab === 'insights' || tab === 'career' || tab === 'roast') && (
                <div style={{
                  background: tab==='roast' ? 'rgba(255,95,126,0.04)' : 'rgba(87,229,160,0.04)',
                  border: `1px solid ${tab==='roast' ? 'rgba(255,95,126,0.15)' : 'rgba(87,229,160,0.15)'}`,
                  borderRadius: 10, padding:'1rem',
                }}>
                  {insightLoading ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                      {[...Array(4)].map((_,i) => <Skeleton key={i} h={12} w={`${100-i*10}%`}/>)}
                    </div>
                  ) : (
                    <p style={{ fontSize:'0.85rem', color:'var(--text2)', lineHeight:1.7, whiteSpace:'pre-wrap' }}>
                      {insight}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem', position:'sticky', top:72 }}>
            {/* Score card */}
            <div className="card-accent" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem', padding:'1.5rem' }}>
              <div className="section-label" style={{ marginBottom:0 }}>Developer Score</div>
              {score !== null && <ScoreRing score={score}/>}
              {/* Stat row */}
              {profile && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', width:'100%' }}>
                  {[
                    { l:'Repos',     v: profile.public_repos },
                    { l:'Followers', v: profile.followers    },
                  ].map(s => (
                    <div key={s.l} style={{ background:'var(--card2)', border:'1px solid var(--border)',
                      borderRadius:8, padding:'0.6rem', textAlign:'center' }}>
                      <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'1rem', fontWeight:700 }}>{fmtNum(s.v)}</div>
                      <div style={{ fontSize:'0.62rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Score breakdown */}
            {breakdown && (
              <div className="card">
                <div className="section-label">Score Breakdown</div>
                <BreakdownBar label="Repositories" icon="📁" value={breakdown.repos      ?? 0} max={30}/>
                <BreakdownBar label="Star Velocity" icon="⭐" value={breakdown.stars      ?? 0} max={30}/>
                <BreakdownBar label="Tech Diversity"icon="💻" value={breakdown.languages  ?? 0} max={20}/>
                <BreakdownBar label="Community"     icon="👥" value={breakdown.followers  ?? 0} max={10}/>
                <BreakdownBar label="Fork Adoption" icon="🍴" value={breakdown.forks      ?? 0} max={10}/>
              </div>
            )}

            {/* Language distribution (sidebar) */}
            {langs.length > 0 && (
              <div className="card">
                <div className="section-label">Languages</div>
                <LangBar langs={langs}/>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}