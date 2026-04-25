import { useState } from 'react';
import { api } from '../utils/api';

const LANG_COLORS = {
  JavaScript:'#f7df1e',TypeScript:'#3178c6',Python:'#3572A5',Go:'#00ADD8',
  Rust:'#dea584',Java:'#b07219','C++':'#f34b7d',Ruby:'#701516',Swift:'#F05138',Kotlin:'#A97BFF',
};
const langColor = l => LANG_COLORS[l] || '#6b7280';

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

/* ─── UserCard ─── */
function UserCard({ data, score, isWinner, loading, empty, rank }) {
  if (loading) return (
    <div className="card" style={{ flex:1, display:'flex', flexDirection:'column', gap:'0.75rem', alignItems:'center', padding:'1.5rem' }}>
      <Skeleton h={72} w={72} style={{ borderRadius:'50%' }}/>
      <Skeleton h={16} w="60%"/><Skeleton h={12} w="40%"/>
    </div>
  );

  if (empty) return (
    <div className="card" style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', padding:'2rem', minHeight:200, opacity:0.4 }}>
      <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>+</div>
      <span style={{ fontSize:'0.75rem', color:'var(--muted)' }}>Add user</span>
    </div>
  );

  if (!data) return null;
  const tier  = tierOf(score ?? 0);
  const color = scoreColor(score ?? 0);
  const r     = 32, circ = 2 * Math.PI * r;

  return (
    <div className="card slide-up" style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center',
      gap:'0.75rem', padding:'1.25rem', position:'relative', textAlign:'center',
      border: isWinner ? `1px solid rgba(87,229,160,0.4)` : '1px solid var(--border)',
      background: isWinner ? 'linear-gradient(135deg,rgba(87,229,160,0.06),var(--card))' : 'var(--card)',
    }}>
      {isWinner && (
        <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)',
          background:'linear-gradient(90deg,var(--accent),#2dd4bf)',
          color:'#000', fontSize:'0.65rem', fontWeight:800, padding:'0.2rem 0.75rem',
          borderRadius:20, whiteSpace:'nowrap' }}>
          🏆 Winner
        </div>
      )}
      {rank <= 3 && !isWinner && (
        <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)',
          fontSize:'1rem' }}>
          {['🥇','🥈','🥉'][rank-1]}
        </div>
      )}

      <img src={data.avatar_url} alt={data.login}
        style={{ width:68, height:68, borderRadius:'50%', border:`2px solid ${isWinner ? 'var(--accent)' : 'var(--border2)'}`, marginTop:'0.25rem' }}/>

      <div>
        <div style={{ fontWeight:800, fontSize:'0.95rem', color:'var(--text)', marginBottom:2 }}>
          {data.name || data.login}
        </div>
        <a href={`https://github.com/${data.login}`} target="_blank" rel="noreferrer"
          style={{ fontSize:'0.75rem', color:'var(--info)', textDecoration:'none', fontFamily:'JetBrains Mono,monospace' }}>
          @{data.login}
        </a>
        {data.bio && <p style={{ fontSize:'0.7rem', color:'var(--muted)', marginTop:'0.3rem', lineHeight:1.4, maxWidth:160 }}>{data.bio}</p>}
      </div>

      {/* Mini ring */}
      <div style={{ position:'relative', width:80, height:80 }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" stroke="var(--border)" strokeWidth="7"/>
          <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - Math.min((score??0)/100,1))}
            strokeLinecap="round" transform="rotate(-90 40 40)"
            style={{ transition:'stroke-dashoffset 0.8s ease' }}/>
          <text x="40" y="40" textAnchor="middle" dy="0.35em" fill="white"
            fontSize="16" fontWeight="800" fontFamily="JetBrains Mono,monospace">{score ?? '—'}</text>
        </svg>
      </div>
      <span className={`badge ${tier.cls}`}>{tier.label}</span>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.375rem', width:'100%' }}>
        {[
          { l:'Repos',  v: data.public_repos },
          { l:'Stars',  v: data.followers    },
          { l:'Follow', v: data.following    },
        ].map(s => (
          <div key={s.l} style={{ background:'var(--card2)', borderRadius:6, padding:'0.4rem',
            border:'1px solid var(--border)', textAlign:'center' }}>
            <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.85rem', fontWeight:700, color:'var(--text)' }}>{s.v}</div>
            <div style={{ fontSize:'0.58rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── CompareTable ─── */
function CompareTable({ users }) {
  const metrics = [
    { label:'Dev Score',  key: u => u.score            },
    { label:'Repos',      key: u => u.data.public_repos },
    { label:'Followers',  key: u => u.data.followers    },
    { label:'Following',  key: u => u.data.following    },
    { label:'Gists',      key: u => u.data.public_gists },
  ];
  return (
    <div className="card" style={{ overflowX:'auto' }}>
      <div className="section-label">Head to Head</div>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>
            <th style={{ fontSize:'0.7rem', color:'var(--muted)', textAlign:'left', padding:'0.5rem 0.5rem',
              fontFamily:'JetBrains Mono,monospace', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>Metric</th>
            {users.map(u => (
              <th key={u.login} style={{ fontSize:'0.72rem', color:'var(--info)', textAlign:'center',
                padding:'0.5rem', fontFamily:'JetBrains Mono,monospace', fontWeight:700 }}>@{u.data.login}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map(m => {
            const vals = users.map(u => m.key(u));
            const maxVal = Math.max(...vals);
            return (
              <tr key={m.label} style={{ borderTop:'1px solid var(--border)' }}>
                <td style={{ fontSize:'0.78rem', color:'var(--text2)', padding:'0.55rem 0.5rem' }}>{m.label}</td>
                {users.map((u,i) => {
                  const v = vals[i];
                  const isTop = v === maxVal && vals.filter(x => x===maxVal).length < vals.length;
                  return (
                    <td key={u.login} style={{ textAlign:'center', padding:'0.55rem 0.5rem',
                      fontFamily:'JetBrains Mono,monospace', fontSize:'0.85rem', fontWeight:700,
                      color: isTop ? 'var(--accent)' : 'var(--muted)' }}>
                      {v ?? '—'}
                      {isTop && <span style={{ marginLeft:4, fontSize:'0.6rem' }}>▲</span>}
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

/* ─── Main Page ─── */
export default function ComparePage() {
  const [inputs,    setInputs]    = useState(['','','','']); // up to 4
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
      // Fetch all profiles + scores in parallel
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

  // Determine winner(s)
  const maxScore = results.length ? Math.max(...results.map(r => r.score ?? 0)) : 0;
  const winners  = results.filter(r => r.score === maxScore && results.filter(x => x.score===maxScore).length < results.length);

  return (
    <div className="fade-in" style={{ maxWidth:1100, margin:'0 auto', padding:'1.5rem 1.25rem' }}>

      {/* Input card */}
      <div className="card" style={{ marginBottom:'1.25rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem' }}>
          <div>
            <div className="section-label" style={{ marginBottom:2 }}>⇌ Compare Developers</div>
            <p style={{ fontSize:'0.8rem', color:'var(--muted)' }}>Compare up to 4 GitHub profiles side by side</p>
          </div>
          <div style={{ display:'flex', gap:'0.375rem' }}>
            {[2,3,4].map(n => (
              <button key={n} onClick={() => setCount(n)}
                style={{ padding:'0.3rem 0.65rem', borderRadius:6, fontSize:'0.75rem', fontWeight:700,
                  cursor:'pointer', border:'1px solid',
                  background: count===n ? 'rgba(87,229,160,0.12)' : 'var(--card2)',
                  color: count===n ? 'var(--accent)' : 'var(--muted)',
                  borderColor: count===n ? 'rgba(87,229,160,0.3)' : 'var(--border)' }}>
                {n} users
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleCompare}>
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${count},1fr)`, gap:'0.625rem', marginBottom:'0.875rem' }}>
            {Array.from({ length: count }).map((_, i) => (
              <input key={i} className="input" placeholder={`User ${i+1}…`}
                value={inputs[i]} onChange={e => setInput(i, e.target.value)}/>
            ))}
          </div>
          <div style={{ display:'flex', gap:'0.625rem', alignItems:'center' }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Comparing…' : '⇌ Compare'}
            </button>
            <button type="button" className="btn btn-secondary"
              onClick={() => { setInputs(['torvalds','gaearon','sindresorhus','yyx990803']); setCount(4); }}>
              Demo
            </button>
            {error && <span style={{ fontSize:'0.8rem', color:'var(--accent3)', marginLeft:'0.25rem' }}>{error}</span>}
          </div>
        </form>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display:'grid', gridTemplateColumns:`repeat(${count},1fr)`, gap:'0.875rem', marginBottom:'1.25rem' }}>
          {Array.from({ length: count }).map((_, i) => (
            <UserCard key={i} loading/>
          ))}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && !loading && (
        <>
          {/* User cards grid */}
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${results.length},1fr)`, gap:'0.875rem', marginBottom:'1.25rem' }}>
            {results.map((u,i) => (
              <UserCard key={u.login} data={u.data} score={u.score}
                isWinner={winners.includes(u)}
                rank={[...results].sort((a,b)=>(b.score??0)-(a.score??0)).findIndex(r=>r.login===u.login)+1}/>
            ))}
          </div>

          {/* Comparison table */}
          <div style={{ marginBottom:'1.25rem' }}>
            <CompareTable users={results}/>
          </div>

          {/* AI verdict */}
          <div className="card">
            <div className="section-label">✨ AI Verdict</div>
            {!aiVerdict && !aiLoading && (
              <button className="btn btn-primary" onClick={getAiVerdict} style={{ width:'100%' }}>
                Generate AI Analysis
              </button>
            )}
            {aiLoading && (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                {[...Array(3)].map((_,i) => <Skeleton key={i} h={12} w={`${90-i*10}%`}/>)}
              </div>
            )}
            {aiVerdict && (
              <div style={{ background:'rgba(87,229,160,0.04)', border:'1px solid rgba(87,229,160,0.15)',
                borderRadius:8, padding:'1rem' }}>
                <p style={{ fontSize:'0.85rem', color:'var(--text2)', lineHeight:1.7, whiteSpace:'pre-wrap' }}>
                  {aiVerdict}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}