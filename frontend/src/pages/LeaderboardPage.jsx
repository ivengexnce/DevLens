import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';

const LANGUAGES = ['All','JavaScript','TypeScript','Python','Go','Rust','Java','C++','Ruby','Swift'];

const scoreColor = s =>
  s >= 80 ? 'var(--accent)' : s >= 60 ? 'var(--info)' : s >= 40 ? 'var(--gold)' : 'var(--accent3)';
const tierOf = s =>
  s >= 80 ? { label:'Elite',        cls:'rank-elite'        } :
  s >= 60 ? { label:'Advanced',     cls:'rank-advanced'     } :
  s >= 40 ? { label:'Intermediate', cls:'rank-intermediate' } :
            { label:'Beginner',     cls:'rank-beginner'     };

function Skeleton({ h=12, w='100%', style={} }) {
  return <div className="skeleton" style={{ height:h, width:w, ...style }}/>;
}

/* ─── RankResult card ─── */
function RankResult({ data, onClose }) {
  if (!data) return null;
  const { username, score, rank, total, percentile, record } = data;
  const pct    = parseFloat(percentile) || 0;
  const color  = scoreColor(score);
  const tier   = tierOf(score);

  return (
    <div className="card slide-up" style={{ border:'1px solid rgba(87,229,160,0.2)',
      background:'linear-gradient(135deg,rgba(87,229,160,0.04),var(--card))', position:'relative' }}>
      <button onClick={onClose} style={{ position:'absolute', top:'0.75rem', right:'0.75rem',
        background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:'1.1rem', lineHeight:1 }}>×</button>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem' }}>
        {record?.avatarUrl && (
          <img src={record.avatarUrl} alt={username}
            style={{ width:56, height:56, borderRadius:'50%', border:'2px solid var(--accent)', flexShrink:0 }}/>
        )}
        <div>
          <div style={{ fontWeight:800, fontSize:'1rem', color:'var(--text)' }}>{record?.name || username}</div>
          <a href={`https://github.com/${username}`} target="_blank" rel="noreferrer"
            style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.78rem', color:'var(--info)', textDecoration:'none' }}>
            @{username}
          </a>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.5rem', marginBottom:'0.875rem' }}>
        {[
          { label:'Dev Score',    value: score,               color },
          { label:'Global Rank',  value: rank ? `#${rank}` : '—', color:'var(--text)' },
          { label:'Percentile',   value: `${pct.toFixed(1)}%`, color },
          { label:'Tier',         value: tier.label,          color },
        ].map(s => (
          <div key={s.label} style={{ background:'var(--card2)', border:'1px solid var(--border)', borderRadius:8, padding:'0.6rem', textAlign:'center' }}>
            <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'1rem', fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'0.6rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Percentile bar */}
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.65rem', color:'var(--muted)', marginBottom:'0.3rem' }}>
          <span>Beginner</span>
          <span style={{ color }}>Top {(100-pct).toFixed(1)}% of {total?.toLocaleString()||'?'} devs</span>
          <span>Elite</span>
        </div>
        <div style={{ height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:3,
            boxShadow:`0 0 8px ${color}66`, transition:'width 0.8s ease' }}/>
        </div>
      </div>

      {record?.topLanguages?.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.375rem', marginTop:'0.75rem' }}>
          {record.topLanguages.map(l => (
            <span key={l} className="badge" style={{ background:'var(--card2)', color:'var(--muted)', border:'1px solid var(--border)' }}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── LeaderCard ─── */
function LeaderCard({ user, index }) {
  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
  const color = scoreColor(user.score ?? 0);
  const tier  = tierOf(user.score ?? 0);

  return (
    <div className="card" style={{ display:'flex', alignItems:'center', gap:'0.875rem', padding:'0.875rem 1rem',
      borderColor: index < 3 ? 'var(--border2)' : 'var(--border)',
      transition:'border-color 0.15s, background 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.background='var(--card2)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor=index<3?'var(--border2)':'var(--border)'; e.currentTarget.style.background='var(--card)'; }}>

      {/* Rank */}
      <div style={{ width:36, textAlign:'center', flexShrink:0 }}>
        {medal
          ? <span style={{ fontSize:'1.2rem' }}>{medal}</span>
          : <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.78rem', fontWeight:700, color:'var(--muted)' }}>#{index+1}</span>}
      </div>

      {/* Avatar */}
      <img src={user.avatarUrl} alt={user.username}
        style={{ width:40, height:40, borderRadius:'50%', border:'1px solid var(--border2)', flexShrink:0 }}/>

      {/* Info */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:700, fontSize:'0.88rem', color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {user.name || user.username}
        </div>
        <a href={`https://github.com/${user.username}`} target="_blank" rel="noreferrer"
          style={{ fontSize:'0.72rem', color:'var(--muted)', textDecoration:'none', fontFamily:'JetBrains Mono,monospace' }}>
          @{user.username}
        </a>
      </div>

      {/* Languages */}
      {user.topLanguages?.[0] && (
        <span className="badge" style={{ background:'var(--card2)', color:'var(--muted)', border:'1px solid var(--border)', display:'flex' }}>
          {user.topLanguages[0]}
        </span>
      )}

      {/* Tier */}
      <span className={`badge ${tier.cls}`} style={{ fontSize:'0.65rem' }}>{tier.label}</span>

      {/* Score */}
      <div style={{ minWidth:44, textAlign:'right' }}>
        <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'1rem', fontWeight:800, color }}>
          {user.score ?? '—'}
        </div>
        <div style={{ fontSize:'0.6rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>pts</div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function LeaderboardPage() {
  const [leaders,  setLeaders]  = useState([]);
  const [stats,    setStats]    = useState(null);
  const [lang,     setLang]     = useState('');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);

  const [searchQ,  setSearchQ]  = useState('');
  const [rankData, setRankData] = useState(null);
  const [rankLoad, setRankLoad] = useState(false);
  const [rankErr,  setRankErr]  = useState('');
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

  // Auto-refresh every 60s
  useEffect(() => {
    const id = setInterval(() => { loadBoard(); }, 60000);
    return () => clearInterval(id);
  }, [lang]);

  async function handleRankSearch(e) {
    e.preventDefault();
    if (!searchQ.trim()) return;
    setRankLoad(true); setRankErr(''); setRankData(null);
    try {
      const d = await api.getRank(searchQ.trim());
      setRankData(d);
      // Refresh leaderboard to include new user
      const [lb, gs] = await Promise.all([api.getLeaderboard(lang), api.getGlobalStats()]);
      setLeaders(Array.isArray(lb) ? lb : lb.leaderboard || []);
      setStats(gs);
      setLastRefresh(new Date());
    } catch (e) { setRankErr(e.message); }
    finally { setRankLoad(false); }
  }

  return (
    <div className="fade-in" style={{ maxWidth:1100, margin:'0 auto', padding:'1.5rem 1.25rem' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
        <div>
          <div className="section-label">▲ Global Leaderboard</div>
          <h1 style={{ fontWeight:800, fontSize:'1.25rem', color:'var(--text)', marginBottom:'0.25rem' }}>
            Developer Rankings
          </h1>
          <p style={{ fontSize:'0.78rem', color:'var(--muted)' }}>
            Our internal scoring system ranks GitHub developers — search any username to add them
          </p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
          {lastRefresh && (
            <span style={{ fontSize:'0.65rem', color:'var(--dim)', fontFamily:'JetBrains Mono,monospace' }}>
              ↻ {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button className="btn btn-secondary" style={{ fontSize:'0.78rem', padding:'0.4rem 0.875rem' }}
            onClick={loadBoard} disabled={loading}>
            {loading ? '↺ Refreshing…' : '↺ Refresh'}
          </button>
        </div>
      </div>

      {/* Rank search */}
      <div className="card" style={{ marginBottom:'1.25rem' }}>
        <div className="section-label">🔍 Find Your GitHub Rank</div>
        <p style={{ fontSize:'0.76rem', color:'var(--muted)', marginBottom:'0.75rem' }}>
          Enter any GitHub username — we'll score them, rank them, and add them to the leaderboard
        </p>
        <form onSubmit={handleRankSearch} style={{ display:'flex', gap:'0.625rem' }}>
          <input ref={inputRef} className="input" placeholder="Enter GitHub username…"
            value={searchQ} onChange={e => setSearchQ(e.target.value)}/>
          <button className="btn btn-primary" type="submit" disabled={rankLoad || !searchQ.trim()}>
            {rankLoad ? 'Searching…' : 'Get Rank'}
          </button>
        </form>
        {rankErr  && <p style={{ fontSize:'0.78rem', color:'var(--accent3)', marginTop:'0.5rem' }}>{rankErr}</p>}
        {rankData && (
          <div style={{ marginTop:'1rem' }}>
            <RankResult data={rankData} onClose={() => { setRankData(null); setSearchQ(''); }}/>
          </div>
        )}
      </div>

      {/* Global stats */}
      {stats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.75rem', marginBottom:'1.25rem' }}>
          {[
            { label:'Profiles Indexed', value: (stats.totalProfiles||0).toLocaleString(), icon:'👥', color:'var(--accent)' },
            { label:'Average Score',    value: stats.avgScore ? stats.avgScore.toFixed(1) : '—',    icon:'📊', color:'var(--info)' },
            { label:'Total Views',      value: (stats.totalViews||0).toLocaleString(),               icon:'👁', color:'var(--accent2)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign:'center', padding:'1rem' }}>
              <div style={{ fontSize:'1.25rem', marginBottom:'0.25rem' }}>{s.icon}</div>
              <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'1.4rem', fontWeight:800, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:'0.65rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Language filter */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.375rem', marginBottom:'1rem' }}>
        {LANGUAGES.map(l => (
          <button key={l} onClick={() => setLang(l === 'All' ? '' : l)}
            style={{ padding:'0.3rem 0.75rem', borderRadius:20, fontSize:'0.72rem', fontWeight:600,
              cursor:'pointer', border:'1px solid', transition:'all 0.15s',
              background: (lang===l || (l==='All' && !lang)) ? 'rgba(87,229,160,0.12)' : 'var(--card2)',
              color: (lang===l || (l==='All' && !lang)) ? 'var(--accent)' : 'var(--muted)',
              borderColor: (lang===l || (l==='All' && !lang)) ? 'rgba(87,229,160,0.3)' : 'var(--border)' }}>
            {l}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && <div style={{ padding:'0.75rem', background:'rgba(255,95,126,0.08)', border:'1px solid rgba(255,95,126,0.2)',
        borderRadius:8, fontSize:'0.82rem', color:'var(--accent3)', marginBottom:'0.875rem' }}>{error}</div>}

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
          {[...Array(8)].map((_,i) => (
            <div key={i} className="card" style={{ display:'flex', alignItems:'center', gap:'0.875rem', padding:'0.875rem 1rem' }}>
              <Skeleton h={14} w={36}/>
              <Skeleton h={40} w={40} style={{ borderRadius:'50%', flexShrink:0 }}/>
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                <Skeleton h={12} w="35%"/><Skeleton h={10} w="20%"/>
              </div>
              <Skeleton h={24} w={44}/>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && leaders.length === 0 && (
        <div style={{ textAlign:'center', padding:'3rem 1rem' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>📭</div>
          <div style={{ fontSize:'0.95rem', fontWeight:700, color:'var(--text)', marginBottom:'0.4rem' }}>No rankings yet</div>
          <p style={{ fontSize:'0.8rem', color:'var(--muted)' }}>
            Use the rank search above to look up any GitHub username.<br/>
            They'll be scored and added to this board instantly.
          </p>
        </div>
      )}

      {/* Leaderboard list */}
      {!loading && leaders.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
          {leaders.map((u, i) => <LeaderCard key={u.username || i} user={u} index={i}/>)}
        </div>
      )}
    </div>
  );
}