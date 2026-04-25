import { useState } from 'react';
import { api } from '../utils/api';

const LANG_COLORS = {
  JavaScript:'#f7df1e', TypeScript:'#3178c6', Python:'#3572A5', Go:'#00ADD8',
  Rust:'#dea584', Java:'#b07219','C++':'#f34b7d', Ruby:'#701516', Swift:'#F05138', Kotlin:'#A97BFF',
};

const scoreColor = s =>
  s >= 80 ? 'var(--emerald)' : s >= 60 ? 'var(--accent)' : s >= 40 ? 'var(--amber)' : 'var(--coral)';

const tierOf = s =>
  s >= 80 ? { label:'Elite',        cls:'rank-elite',        icon:'◈' } :
  s >= 60 ? { label:'Advanced',     cls:'rank-advanced',     icon:'◉' } :
  s >= 40 ? { label:'Intermediate', cls:'rank-intermediate', icon:'◎' } :
            { label:'Beginner',     cls:'rank-beginner',     icon:'○' };

const fmtNum = n => {
  if (n === null || n === undefined) return '—';
  if (n >= 1000) return `${(n/1000).toFixed(1)}k`;
  return String(n);
};

function Sk({ h=12, w='100%', style={} }) {
  return <div className="skeleton" style={{ height:h, width:w, borderRadius:6, ...style }}/>;
}

/* ─── UserCard ─── */
function UserCard({ data, score, isWinner, loading, empty, rank }) {
  if (loading) return (
    <div className="card" style={{ flex:1, display:'flex', flexDirection:'column', gap:'0.875rem', alignItems:'center', padding:'1.5rem' }}>
      <Sk h={72} w={72} style={{ borderRadius:14 }}/>
      <Sk h={16} w="55%"/>
      <Sk h={11} w="35%"/>
      <Sk h={80} w={80} style={{ borderRadius:'50%' }}/>
    </div>
  );
  if (empty) return (
    <div style={{
      flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      padding:'2.5rem 1.5rem', minHeight:220,
      background:'var(--card)', border:'1px dashed var(--border-2)',
      borderRadius:16, opacity:0.5,
    }}>
      <div style={{ fontSize:'2rem', marginBottom:'0.5rem', color:'var(--text-3)' }}>+</div>
      <span style={{ fontSize:'0.75rem', color:'var(--text-3)', fontFamily:"'Space Grotesk',sans-serif" }}>Add developer</span>
    </div>
  );
  if (!data) return null;

  const tier  = tierOf(score ?? 0);
  const color = scoreColor(score ?? 0);
  const r     = 34, circ = 2 * Math.PI * r;
  const pct   = Math.min((score ?? 0) / 100, 1);

  return (
    <div className="card slide-up" style={{
      flex:1, display:'flex', flexDirection:'column', alignItems:'center',
      gap:'0.875rem', padding:'1.5rem', position:'relative', textAlign:'center',
      border: isWinner ? '1px solid rgba(0,212,255,0.35)' : '1px solid var(--border)',
      background: isWinner ? 'linear-gradient(160deg,rgba(0,212,255,0.05) 0%,var(--card) 60%)' : 'var(--card)',
      overflow:'hidden',
    }}>
      {/* Winner glow bg */}
      {isWinner && (
        <div style={{
          position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
          width:'80%', height:80,
          background:'radial-gradient(ellipse at top, rgba(0,212,255,0.12) 0%, transparent 70%)',
          pointerEvents:'none',
        }}/>
      )}

      {/* Winner / rank badge */}
      {isWinner ? (
        <div style={{
          position:'absolute', top:-1, left:'50%', transform:'translateX(-50%)',
          background:'linear-gradient(90deg, var(--accent), var(--emerald))',
          color:'#030610', fontSize:'0.62rem', fontWeight:800, padding:'0.2rem 0.875rem',
          borderRadius:'0 0 10px 10px', whiteSpace:'nowrap', letterSpacing:'0.06em',
          fontFamily:"'Fira Code',monospace",
        }}>
          ◈ WINNER
        </div>
      ) : rank <= 3 && (
        <div style={{ position:'absolute', top:8, right:10, fontSize:'1rem' }}>
          {['🥇','🥈','🥉'][rank-1]}
        </div>
      )}

      {/* Avatar */}
      <img src={data.avatar_url} alt={data.login} style={{
        width:72, height:72, borderRadius:14,
        border:`2px solid ${isWinner ? 'var(--accent)' : 'var(--border-2)'}`,
        boxShadow: isWinner ? '0 0 20px var(--accent-dim)' : 'none',
        marginTop: isWinner ? '0.75rem' : 0,
      }}/>

      {/* Name */}
      <div>
        <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:'1rem', color:'var(--text)', marginBottom:3, letterSpacing:'-0.01em' }}>
          {data.name || data.login}
        </div>
        <a href={`https://github.com/${data.login}`} target="_blank" rel="noreferrer"
          style={{ fontSize:'0.73rem', color:'var(--accent)', textDecoration:'none', fontFamily:"'Fira Code',monospace" }}>
          @{data.login}
        </a>
        {data.bio && (
          <p style={{ fontSize:'0.7rem', color:'var(--text-3)', marginTop:'0.35rem', lineHeight:1.5, maxWidth:160 }}>
            {data.bio.length > 60 ? data.bio.slice(0, 60) + '…' : data.bio}
          </p>
        )}
      </div>

      {/* Score ring */}
      <div style={{ position:'relative', width:82, height:82 }}>
        <svg width="82" height="82" viewBox="0 0 82 82">
          <defs>
            <filter id={`glow-${data.login}`}>
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <circle cx="41" cy="41" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7"/>
          <circle cx="41" cy="41" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            strokeLinecap="round"
            transform="rotate(-90 41 41)"
            filter={`url(#glow-${data.login})`}
            style={{ transition:'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}/>
          <text x="41" y="41" textAnchor="middle" dy="0.35em" fill="white"
            fontSize="15" fontWeight="800" fontFamily="'Fira Code',monospace">{score ?? '—'}</text>
        </svg>
      </div>

      <span className={`badge ${tier.cls}`} style={{ fontSize:'0.65rem', letterSpacing:'0.06em' }}>
        {tier.icon} {tier.label}
      </span>

      {/* Stats grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.375rem', width:'100%' }}>
        {[
          { l:'Repos',    v:data.public_repos },
          { l:'Followers',v:data.followers    },
          { l:'Stars',    v:null              }, // filled per-user via stars
        ].map(s => (
          <div key={s.l} style={{
            background:'var(--surface-2)', border:'1px solid var(--border)',
            borderRadius:8, padding:'0.45rem', textAlign:'center',
          }}>
            <div style={{ fontFamily:"'Fira Code',monospace", fontSize:'0.85rem', fontWeight:700, color:'var(--text)' }}>
              {s.v !== null ? fmtNum(s.v) : '—'}
            </div>
            <div style={{ fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:1 }}>
              {s.l}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── CompareTable ─── */
function CompareTable({ users }) {
  const metrics = [
    { label:'Dev Score',   fn: u => u.score,              fmt: v => v ?? '—' },
    { label:'Repos',       fn: u => u.data.public_repos,  fmt: fmtNum       },
    { label:'Followers',   fn: u => u.data.followers,     fmt: fmtNum       },
    { label:'Following',   fn: u => u.data.following,     fmt: fmtNum       },
    { label:'Gists',       fn: u => u.data.public_gists,  fmt: fmtNum       },
    { label:'Stars',       fn: u => u.stars,              fmt: fmtNum       },
  ];

  return (
    <div className="card" style={{ overflowX:'auto' }}>
      <div className="section-label">Head to Head</div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Metric</th>
            {users.map(u => (
              <th key={u.login} style={{ color:'var(--accent)', textAlign:'center' }}>@{u.data.login}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map(m => {
            const vals = users.map(u => m.fn(u));
            const numVals = vals.map(v => typeof v === 'number' ? v : -1);
            const maxVal = Math.max(...numVals);
            return (
              <tr key={m.label}>
                <td style={{ color:'var(--text-2)', fontSize:'0.8rem' }}>{m.label}</td>
                {users.map((u, i) => {
                  const v = vals[i];
                  const nv = numVals[i];
                  const isTop = nv === maxVal && nv >= 0 && numVals.filter(x => x === maxVal).length < numVals.length;
                  return (
                    <td key={u.login} style={{ textAlign:'center' }}>
                      <span style={{
                        fontFamily:"'Fira Code',monospace", fontSize:'0.88rem', fontWeight:700,
                        color: isTop ? 'var(--emerald)' : 'var(--text-2)',
                      }}>
                        {m.fmt(v)}
                        {isTop && <span style={{ marginLeft:4, fontSize:'0.6rem', color:'var(--emerald)' }}>▲</span>}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Radar Chart ─── */
function RadarChart({ users }) {
  if (users.length < 2) return null;
  const dims = ['repos','stars','score','followers','gists'];
  const labels = ['Repos','Stars','Score','Followers','Gists'];
  const maxes = { repos:200, stars:10000, score:100, followers:5000, gists:100 };
  const colors = ['var(--accent)','var(--violet)','var(--emerald)','var(--amber)'];

  const W = 240, H = 220, cx = W/2, cy = H/2, R = 85;
  const angles = dims.map((_, i) => (i * 2 * Math.PI / dims.length) - Math.PI/2);

  const pts = (user) => dims.map((d, i) => {
    let val = 0;
    if (d === 'repos')     val = user.data.public_repos || 0;
    else if (d === 'stars')val = user.stars || 0;
    else if (d === 'score')val = user.score || 0;
    else if (d === 'followers') val = user.data.followers || 0;
    else if (d === 'gists') val = user.data.public_gists || 0;
    const pct = Math.min(val / maxes[d], 1);
    return [cx + R * pct * Math.cos(angles[i]), cy + R * pct * Math.sin(angles[i])];
  });

  const polygon = (points) => points.map(p => p.join(',')).join(' ');

  return (
    <div className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
      <div className="section-label">Skill Radar</div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Grid rings */}
        {[0.2,0.4,0.6,0.8,1].map(f => (
          <polygon key={f}
            points={polygon(angles.map(a => [cx + R*f*Math.cos(a), cy + R*f*Math.sin(a)]))}
            fill="none" stroke="var(--border)" strokeWidth="1"/>
        ))}
        {/* Axis lines */}
        {angles.map((a, i) => (
          <line key={i} x1={cx} y1={cy}
            x2={cx + R*Math.cos(a)} y2={cy + R*Math.sin(a)}
            stroke="var(--border)" strokeWidth="1"/>
        ))}
        {/* Labels */}
        {angles.map((a, i) => (
          <text key={i}
            x={cx + (R+16)*Math.cos(a)} y={cy + (R+16)*Math.sin(a)}
            textAnchor="middle" dominantBaseline="central"
            fill="var(--text-3)" fontSize="9" fontFamily="'Fira Code',monospace">
            {labels[i]}
          </text>
        ))}
        {/* User polygons */}
        {users.map((u, ui) => {
          const p = pts(u);
          return (
            <g key={u.login}>
              <polygon points={polygon(p)}
                fill={colors[ui]} fillOpacity="0.1"
                stroke={colors[ui]} strokeWidth="1.5" strokeOpacity="0.8"/>
              {p.map(([x,y], i) => (
                <circle key={i} cx={x} cy={y} r="3" fill={colors[ui]}/>
              ))}
            </g>
          );
        })}
      </svg>
      {/* Legend */}
      <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', justifyContent:'center' }}>
        {users.map((u, i) => (
          <div key={u.login} style={{ display:'flex', alignItems:'center', gap:'0.375rem' }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:colors[i] }}/>
            <span style={{ fontSize:'0.72rem', color:'var(--text-2)', fontFamily:"'Fira Code',monospace" }}>@{u.login}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function ComparePage() {
  const [inputs,    setInputs]    = useState(['','','','']);
  const [count,     setCount]     = useState(2);
  const [results,   setResults]   = useState([]);
  const [aiVerdict, setAiVerdict] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error,     setError]     = useState('');

  const setInput = (i, v) => setInputs(prev => { const n=[...prev]; n[i]=v; return n; });

  async function handleCompare(e) {
    e.preventDefault();
    const usernames = inputs.slice(0, count).map(s => s.trim()).filter(Boolean);
    if (usernames.length < 2) { setError('Enter at least 2 usernames.'); return; }
    setLoading(true); setError(''); setResults([]); setAiVerdict('');
    try {
      const fetched = await Promise.all(
        usernames.map(async (u) => {
          const [p, s, r] = await Promise.all([
            api.getProfile(u),
            api.getScore(u),
            api.getRepos(u).catch(() => []),
          ]);
          const stars = (r || []).reduce((acc, repo) => acc + (repo.stargazers_count||0), 0);
          return { login: u, data: p, score: s.score ?? s, stars };
        })
      );
      setResults(fetched);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function getAiVerdict() {
    if (results.length < 2) return;
    setAiLoading(true);
    try {
      const d = await api.compare(results[0].login, results[1].login);
      setAiVerdict(d.comparison);
    } catch { setAiVerdict('Failed to get AI verdict.'); }
    finally { setAiLoading(false); }
  }

  const maxScore = results.length ? Math.max(...results.map(r => r.score ?? 0)) : 0;
  const winners  = results.filter(r => r.score === maxScore && results.filter(x => x.score === maxScore).length < results.length);

  return (
    <div className="fade-in" style={{ maxWidth:1120, margin:'0 auto', padding:'2rem 1.5rem' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom:'1.5rem' }}>
        <div style={{
          display:'inline-flex', alignItems:'center', gap:'0.5rem',
          padding:'0.3rem 0.875rem', borderRadius:100,
          background:'rgba(124,106,255,0.08)', border:'1px solid rgba(124,106,255,0.2)',
          marginBottom:'0.875rem',
        }}>
          <span style={{ fontSize:'0.7rem', color:'var(--violet)', fontFamily:"'Fira Code',monospace", fontWeight:600, letterSpacing:'0.1em' }}>
            COMPARE DEVELOPERS
          </span>
        </div>
        <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:'1.75rem', color:'var(--text)', letterSpacing:'-0.03em' }}>
          Head-to-Head Analysis
        </h1>
        <p style={{ fontSize:'0.85rem', color:'var(--text-3)', marginTop:'0.25rem' }}>
          Compare up to 4 GitHub profiles with AI-powered insights
        </p>
      </div>

      {/* ── Input card ── */}
      <div className="card" style={{ marginBottom:'1.25rem', padding:'1.5rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
          <span style={{ fontSize:'0.8rem', color:'var(--text-2)' }}>Number of developers</span>
          <div style={{ display:'flex', gap:'0.375rem' }}>
            {[2,3,4].map(n => (
              <button key={n} onClick={() => setCount(n)}
                style={{
                  padding:'0.3rem 0.875rem', borderRadius:7, fontSize:'0.78rem', fontWeight:700,
                  cursor:'pointer', border:'1px solid', transition:'all 0.15s',
                  fontFamily:"'Space Grotesk',sans-serif",
                  background: count===n ? 'var(--violet-dim)' : 'var(--card-2)',
                  color: count===n ? 'var(--violet)' : 'var(--text-3)',
                  borderColor: count===n ? 'rgba(124,106,255,0.3)' : 'var(--border)',
                }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleCompare}>
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${count},1fr)`, gap:'0.625rem', marginBottom:'1rem' }}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} style={{ position:'relative' }}>
                <span style={{
                  position:'absolute', left:'0.875rem', top:'50%', transform:'translateY(-50%)',
                  color:'var(--text-3)', fontSize:'0.82rem', fontFamily:"'Fira Code',monospace",
                  pointerEvents:'none',
                }}>@</span>
                <input className="input" style={{ paddingLeft:'1.85rem' }}
                  placeholder={`user ${i+1}`}
                  value={inputs[i]} onChange={e => setInput(i, e.target.value)}/>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:'0.625rem', alignItems:'center' }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? (
                <><div className="loading-dots"><span/><span/><span/></div> Comparing…</>
              ) : '⇌ Compare'}
            </button>
            <button type="button" className="btn btn-secondary"
              onClick={() => { setInputs(['torvalds','gaearon','sindresorhus','yyx990803']); setCount(4); }}>
              Load Demo
            </button>
            {error && (
              <span style={{ fontSize:'0.8rem', color:'var(--coral)', marginLeft:'0.25rem' }}>⚠ {error}</span>
            )}
          </div>
        </form>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div style={{ display:'grid', gridTemplateColumns:`repeat(${count},1fr)`, gap:'1rem', marginBottom:'1.25rem' }}>
          {Array.from({ length: count }).map((_, i) => (
            <UserCard key={i} loading/>
          ))}
        </div>
      )}

      {/* ── Results ── */}
      {results.length > 0 && !loading && (
        <div className="slide-up">
          {/* User cards */}
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${results.length},1fr)`, gap:'1rem', marginBottom:'1.25rem' }}>
            {results.map((u, i) => (
              <UserCard key={u.login} data={u.data} score={u.score}
                isWinner={winners.includes(u)}
                rank={[...results].sort((a,b) => (b.score??0)-(a.score??0)).findIndex(r => r.login===u.login)+1}/>
            ))}
          </div>

          {/* Comparison table + radar */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:'1rem', marginBottom:'1.25rem' }}>
            <CompareTable users={results}/>
            {results.length >= 2 && <RadarChart users={results}/>}
          </div>

          {/* AI verdict */}
          <div className="card" style={{ padding:'1.5rem' }}>
            <div className="section-label">AI Verdict</div>
            {!aiVerdict && !aiLoading && (
              <div style={{ textAlign:'center', padding:'1.5rem 0' }}>
                <p style={{ fontSize:'0.83rem', color:'var(--text-3)', marginBottom:'1rem' }}>
                  Get an AI-powered analysis comparing these developers
                </p>
                <button className="btn btn-primary" onClick={getAiVerdict}>
                  ✦ Generate AI Analysis
                </button>
              </div>
            )}
            {aiLoading && (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                {[100,88,72,60,48].map((w,i) => <Sk key={i} h={11} w={`${w}%`}/>)}
              </div>
            )}
            {aiVerdict && (
              <div style={{
                background:'rgba(0,212,255,0.04)', border:'1px solid rgba(0,212,255,0.12)',
                borderRadius:10, padding:'1.125rem', position:'relative', overflow:'hidden',
              }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:1,
                  background:'linear-gradient(90deg, transparent, var(--accent), transparent)', opacity:0.5 }}/>
                <p style={{ fontSize:'0.85rem', color:'var(--text-2)', lineHeight:1.8, whiteSpace:'pre-wrap',
                  fontFamily:"'Space Grotesk',sans-serif" }}>
                  {aiVerdict}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}