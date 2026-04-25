import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';

const LANGUAGES = ['All','JavaScript','TypeScript','Python','Go','Rust','Java','C++','Ruby','Swift'];

const scoreColor = s =>
  s >= 80 ? 'var(--emerald)' : s >= 60 ? 'var(--accent)' : s >= 40 ? 'var(--amber)' : 'var(--coral)';
const tierOf = s =>
  s >= 80 ? { label:'Elite',        cls:'rank-elite',        icon:'◈' } :
  s >= 60 ? { label:'Advanced',     cls:'rank-advanced',     icon:'◉' } :
  s >= 40 ? { label:'Intermediate', cls:'rank-intermediate', icon:'◎' } :
            { label:'Beginner',     cls:'rank-beginner',     icon:'○' };

function Sk({ h=12, w='100%', style={} }) {
  return <div className="skeleton" style={{ height:h, width:w, borderRadius:6, ...style }}/>;
}

/* ─── RankResult ─── */
function RankResult({ data, onClose }) {
  if (!data) return null;
  const { username, score, rank, total, percentile, record } = data;
  const pct   = parseFloat(percentile) || 0;
  const color = scoreColor(score);
  const tier  = tierOf(score);

  return (
    <div className="card-accent slide-up" style={{ position:'relative', marginTop:'1rem' }}>
      {/* Top accent bar */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:2,
        background:`linear-gradient(90deg, transparent, ${color}, transparent)`, borderRadius:'12px 12px 0 0',
      }}/>

      <button onClick={onClose} style={{
        position:'absolute', top:'0.875rem', right:'0.875rem',
        width:28, height:28, borderRadius:7, background:'var(--card-2)',
        border:'1px solid var(--border)', color:'var(--text-3)',
        cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem',
      }}>
        ×
      </button>

      <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.25rem' }}>
        {record?.avatarUrl && (
          <img src={record.avatarUrl} alt={username} style={{
            width:60, height:60, borderRadius:14,
            border:`2px solid ${color}50`,
            boxShadow:`0 0 20px ${color}30`,
            flexShrink:0,
          }}/>
        )}
        <div>
          <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:'1.1rem',
            color:'var(--text)', marginBottom:2 }}>
            {record?.name || username}
          </div>
          <a href={`https://github.com/${username}`} target="_blank" rel="noreferrer"
            style={{ fontFamily:"'Fira Code',monospace", fontSize:'0.8rem', color:'var(--accent)', textDecoration:'none' }}>
            @{username}
          </a>
        </div>
        <span className={`badge ${tier.cls}`} style={{ marginLeft:'auto', fontSize:'0.7rem' }}>
          {tier.icon} {tier.label}
        </span>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.625rem', marginBottom:'1rem' }}>
        {[
          { label:'Dev Score',  value:score,              color },
          { label:'Rank',       value:rank ? `#${rank}` : '—', color:'var(--text)' },
          { label:'Percentile', value:`${pct.toFixed(1)}%`, color },
          { label:'Profiles',   value:(total||0).toLocaleString(), color:'var(--text-2)' },
        ].map(s => (
          <div key={s.label} style={{
            background:'var(--surface-2)', border:'1px solid var(--border)',
            borderRadius:10, padding:'0.75rem', textAlign:'center',
          }}>
            <div style={{ fontFamily:"'Fira Code',monospace", fontSize:'1.1rem', fontWeight:800, color:s.color, lineHeight:1.2 }}>
              {s.value}
            </div>
            <div style={{ fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:3 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Percentile bar */}
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.65rem', color:'var(--text-3)',
          fontFamily:"'Fira Code',monospace", marginBottom:'0.4rem' }}>
          <span>Beginner</span>
          <span style={{ color }}>Top {(100-pct).toFixed(1)}%</span>
          <span>Elite</span>
        </div>
        <div className="progress-track" style={{ height:6 }}>
          <div className="progress-fill" style={{ width:`${pct}%`, background:color, boxShadow:`0 0 10px ${color}60` }}/>
        </div>
      </div>

      {record?.topLanguages?.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.375rem', marginTop:'0.875rem' }}>
          {record.topLanguages.map(l => (
            <span key={l} className="badge" style={{ background:'var(--surface-2)', color:'var(--text-3)', borderColor:'var(--border)' }}>
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── LeaderCard ─── */
function LeaderCard({ user, index }) {
  const medal  = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
  const color  = scoreColor(user.score ?? 0);
  const tier   = tierOf(user.score ?? 0);
  const isTop3 = index < 3;

  return (
    <div className="leader-row slide-up" style={{
      animationDelay:`${Math.min(index * 30, 300)}ms`,
      borderColor: isTop3 ? 'var(--border-2)' : 'var(--border)',
    }}>
      {/* Rank number */}
      <div style={{ width:40, textAlign:'center', flexShrink:0 }}>
        {medal ? (
          <span style={{ fontSize:'1.25rem' }}>{medal}</span>
        ) : (
          <span style={{ fontFamily:"'Fira Code',monospace", fontSize:'0.78rem', fontWeight:700,
            color: index < 10 ? 'var(--text-2)' : 'var(--text-3)' }}>
            #{index+1}
          </span>
        )}
      </div>

      {/* Avatar */}
      <img src={user.avatarUrl} alt={user.username} style={{
        width:42, height:42, borderRadius:10,
        border:`1px solid ${isTop3 ? 'var(--border-2)' : 'var(--border)'}`,
        flexShrink:0,
      }}/>

      {/* Info */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:'0.9rem',
          color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', letterSpacing:'-0.01em' }}>
          {user.name || user.username}
        </div>
        <a href={`https://github.com/${user.username}`} target="_blank" rel="noreferrer"
          style={{ fontSize:'0.72rem', color:'var(--text-3)', textDecoration:'none',
            fontFamily:"'Fira Code',monospace" }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
          @{user.username}
        </a>
      </div>

      {/* Langs */}
      {user.topLanguages?.[0] && (
        <span className="badge" style={{
          background:'var(--surface-2)', color:'var(--text-3)',
          borderColor:'var(--border)', display:'none',
        }}>
          {/* hidden on small screens */}
        </span>
      )}
      {user.topLanguages?.slice(0, 2).map(l => (
        <span key={l} className="badge" style={{
          background:'var(--surface-2)', color:'var(--text-3)',
          borderColor:'var(--border)', fontSize:'0.65rem',
        }}>
          {l}
        </span>
      ))}

      {/* Tier */}
      <span className={`badge ${tier.cls}`} style={{ fontSize:'0.65rem', letterSpacing:'0.05em' }}>
        {tier.icon}
      </span>

      {/* Score bar */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.25rem', minWidth:70 }}>
        <span style={{ fontFamily:"'Fira Code',monospace", fontSize:'1rem', fontWeight:800, color, lineHeight:1 }}>
          {user.score ?? '—'}
        </span>
        <div style={{ width:60, height:3, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
          <div style={{ width:`${user.score ?? 0}%`, height:'100%', background:color,
            borderRadius:2, boxShadow:`0 0 5px ${color}80` }}/>
        </div>
      </div>
    </div>
  );
}

/* ─── Top 3 Podium ─── */
function Podium({ leaders }) {
  if (!leaders.length) return null;
  const top = leaders.slice(0, 3);
  const order = top.length >= 3 ? [top[1], top[0], top[2]] : top; // 2nd, 1st, 3rd

  return (
    <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:'1rem', marginBottom:'1.5rem', paddingTop:'1rem' }}>
      {order.map((u, i) => {
        const isFirst = u === top[0];
        const height = isFirst ? 110 : i === 0 ? 88 : 72;
        const color = scoreColor(u.score ?? 0);
        return (
          <div key={u.username} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.5rem' }}>
            {isFirst && <div style={{ fontSize:'1.5rem' }}>👑</div>}
            <img src={u.avatarUrl} alt={u.username} style={{
              width: isFirst ? 60 : 50, height: isFirst ? 60 : 50,
              borderRadius:12,
              border:`2px solid ${color}60`,
              boxShadow:`0 0 16px ${color}30`,
            }}/>
            <div style={{ fontFamily:"'Fira Code',monospace", fontSize:'0.78rem', fontWeight:700, color }}>
              {u.score}
            </div>
            <a href={`https://github.com/${u.username}`} target="_blank" rel="noreferrer"
              style={{ fontSize:'0.68rem', color:'var(--text-3)', textDecoration:'none', fontFamily:"'Fira Code',monospace" }}>
              @{u.username.length > 10 ? u.username.slice(0,10)+'…' : u.username}
            </a>
            {/* Podium block */}
            <div style={{
              width: isFirst ? 90 : 78, height,
              background:`linear-gradient(180deg, ${color}18, ${color}08)`,
              border:`1px solid ${color}30`,
              borderBottom:'none',
              borderRadius:'8px 8px 0 0',
              display:'flex', alignItems:'flex-start', justifyContent:'center',
              paddingTop:'0.5rem',
            }}>
              <span style={{ fontSize: isFirst ? '1.25rem' : '1rem' }}>
                {['🥇','🥈','🥉'][top.indexOf(u)]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Page ─── */
export default function LeaderboardPage() {
  const [leaders,     setLeaders]     = useState([]);
  const [stats,       setStats]       = useState(null);
  const [lang,        setLang]        = useState('');
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);
  const [searchQ,     setSearchQ]     = useState('');
  const [rankData,    setRankData]    = useState(null);
  const [rankLoad,    setRankLoad]    = useState(false);
  const [rankErr,     setRankErr]     = useState('');
  const inputRef = useRef(null);

  async function loadBoard() {
    setLoading(true); setError('');
    try {
      const [lb, gs] = await Promise.all([api.getLeaderboard(lang), api.getGlobalStats()]);
      setLeaders(Array.isArray(lb) ? lb : lb.leaderboard || []);
      setStats(gs);
      setLastRefresh(new Date());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadBoard(); }, [lang]);
  useEffect(() => {
    const id = setInterval(loadBoard, 60000);
    return () => clearInterval(id);
  }, [lang]);

  async function handleRankSearch(e) {
    e.preventDefault();
    if (!searchQ.trim()) return;
    setRankLoad(true); setRankErr(''); setRankData(null);
    try {
      const d = await api.getRank(searchQ.trim());
      setRankData(d);
      const [lb, gs] = await Promise.all([api.getLeaderboard(lang), api.getGlobalStats()]);
      setLeaders(Array.isArray(lb) ? lb : lb.leaderboard || []);
      setStats(gs);
      setLastRefresh(new Date());
    } catch (e) { setRankErr(e.message); }
    finally { setRankLoad(false); }
  }

  return (
    <div className="fade-in" style={{ maxWidth:1120, margin:'0 auto', padding:'2rem 1.5rem' }}>

      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:'0.5rem',
            padding:'0.3rem 0.875rem', borderRadius:100,
            background:'rgba(255,215,0,0.07)', border:'1px solid rgba(255,215,0,0.2)',
            marginBottom:'0.875rem',
          }}>
            <span style={{ fontSize:'0.7rem', color:'var(--gold)', fontFamily:"'Fira Code',monospace", fontWeight:600, letterSpacing:'0.1em' }}>
              GLOBAL RANKINGS
            </span>
          </div>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:'1.75rem', color:'var(--text)', letterSpacing:'-0.03em' }}>
            Developer Leaderboard
          </h1>
          <p style={{ fontSize:'0.85rem', color:'var(--text-3)', marginTop:'0.25rem' }}>
            Search any GitHub username to score and rank them globally
          </p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
          {lastRefresh && (
            <span style={{ fontSize:'0.65rem', color:'var(--text-4)', fontFamily:"'Fira Code',monospace" }}>
              ↻ {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button className="btn btn-secondary" style={{ fontSize:'0.78rem' }}
            onClick={loadBoard} disabled={loading}>
            {loading ? (
              <><div className="loading-dots"><span/><span/><span/></div></>
            ) : '↺ Refresh'}
          </button>
        </div>
      </div>

      {/* ── Global Stats ── */}
      {stats && (
        <div className="stagger" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.875rem', marginBottom:'1.25rem' }}>
          {[
            { label:'Profiles Indexed', value:(stats.totalProfiles||0).toLocaleString(), icon:'👥', color:'var(--accent)' },
            { label:'Average Score',    value:stats.avgScore ? stats.avgScore.toFixed(1):'—',       icon:'◉',  color:'var(--violet)' },
            { label:'Total Views',      value:(stats.totalViews||0).toLocaleString(),                icon:'👁', color:'var(--emerald)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign:'center', padding:'1.25rem', slide_up:true }}>
              <div style={{ fontSize:'1.4rem', marginBottom:'0.375rem' }}>{s.icon}</div>
              <div style={{ fontFamily:"'Fira Code',monospace", fontSize:'1.6rem', fontWeight:800,
                color:s.color, lineHeight:1.2, marginBottom:2 }}>
                {s.value}
              </div>
              <div style={{ fontSize:'0.65rem', color:'var(--text-3)', textTransform:'uppercase',
                letterSpacing:'0.1em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2-col layout: search + list */}
      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:'1.25rem', alignItems:'start' }}>

        {/* ── Left: Search + filters ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem', position:'sticky', top:76 }}>

          {/* Rank search card */}
          <div className="card" style={{ padding:'1.25rem' }}>
            <div className="section-label">Find Your Rank</div>
            <p style={{ fontSize:'0.75rem', color:'var(--text-3)', marginBottom:'0.875rem', lineHeight:1.6 }}>
              Score any GitHub developer and place them on the board
            </p>
            <form onSubmit={handleRankSearch} style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
              <div style={{ position:'relative' }}>
                <span style={{
                  position:'absolute', left:'0.875rem', top:'50%', transform:'translateY(-50%)',
                  color:'var(--text-3)', fontSize:'0.82rem', fontFamily:"'Fira Code',monospace", pointerEvents:'none',
                }}>@</span>
                <input ref={inputRef} className="input" style={{ paddingLeft:'1.85rem' }}
                  placeholder="username"
                  value={searchQ} onChange={e => setSearchQ(e.target.value)}/>
              </div>
              <button className="btn btn-primary" type="submit"
                disabled={rankLoad || !searchQ.trim()} style={{ width:'100%' }}>
                {rankLoad ? (
                  <><div className="loading-dots"><span/><span/><span/></div> Ranking…</>
                ) : '◈ Get Rank'}
              </button>
            </form>
            {rankErr && (
              <p style={{ fontSize:'0.75rem', color:'var(--coral)', marginTop:'0.5rem' }}>⚠ {rankErr}</p>
            )}
            {rankData && (
              <RankResult data={rankData} onClose={() => { setRankData(null); setSearchQ(''); }}/>
            )}
          </div>

          {/* Language filter */}
          <div className="card" style={{ padding:'1.25rem' }}>
            <div className="section-label">Filter by Language</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
              {LANGUAGES.map(l => (
                <button key={l} onClick={() => setLang(l === 'All' ? '' : l)}
                  style={{
                    padding:'0.45rem 0.875rem', borderRadius:7, fontSize:'0.78rem', fontWeight:500,
                    cursor:'pointer', border:'1px solid', transition:'all 0.15s', textAlign:'left',
                    fontFamily:"'Space Grotesk',sans-serif",
                    background: (lang===l || (l==='All' && !lang)) ? 'var(--accent-dim)' : 'transparent',
                    color: (lang===l || (l==='All' && !lang)) ? 'var(--accent)' : 'var(--text-3)',
                    borderColor: (lang===l || (l==='All' && !lang)) ? 'var(--border-accent)' : 'transparent',
                  }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Leaderboard ── */}
        <div>
          {/* Error */}
          {error && (
            <div style={{ padding:'0.75rem 1rem', background:'var(--coral-dim)',
              border:'1px solid rgba(255,95,126,0.2)', borderRadius:10,
              fontSize:'0.82rem', color:'var(--coral)', marginBottom:'1rem' }}>
              ⚠ {error}
            </div>
          )}

          {/* Podium (top 3) */}
          {!loading && leaders.length >= 3 && <Podium leaders={leaders}/>}

          {/* Loading skeletons */}
          {loading && (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              {[...Array(10)].map((_,i) => (
                <div key={i} className="card" style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'0.875rem 1.125rem' }}>
                  <Sk h={12} w={40}/>
                  <Sk h={42} w={42} style={{ borderRadius:10, flexShrink:0 }}/>
                  <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'0.375rem' }}>
                    <Sk h={12} w="40%"/>
                    <Sk h={10} w="22%"/>
                  </div>
                  <Sk h={24} w={44}/>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && leaders.length === 0 && (
            <div style={{ textAlign:'center', padding:'4rem 2rem' }}>
              <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>◈</div>
              <div style={{ fontWeight:700, fontSize:'1rem', color:'var(--text)', marginBottom:'0.5rem' }}>No rankings yet</div>
              <p style={{ fontSize:'0.82rem', color:'var(--text-3)' }}>
                Use the rank search to look up any GitHub username.<br/>
                They'll be scored and added instantly.
              </p>
            </div>
          )}

          {/* List */}
          {!loading && leaders.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              {leaders.map((u, i) => <LeaderCard key={u.username || i} user={u} index={i}/>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}