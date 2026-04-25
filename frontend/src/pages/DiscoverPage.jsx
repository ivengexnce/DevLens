import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

const LANG_COLORS = {
  JavaScript:'#f7df1e', TypeScript:'#3178c6', Python:'#3572A5', Go:'#00ADD8',
  Rust:'#dea584', Java:'#b07219','C++':'#f34b7d', Ruby:'#701516', Swift:'#F05138',
  Kotlin:'#A97BFF', Vue:'#41b883', CSS:'#563d7c', HTML:'#e34c26', Shell:'#89e051',
};
const langColor = l => LANG_COLORS[l] || '#4a5568';

const LANGUAGES = ['JavaScript','TypeScript','Python','Go','Rust','Java','C++','Ruby','Swift','Kotlin'];
const SORT_OPTIONS = [
  { value:'stars',   label:'⭐ Stars'   },
  { value:'forks',   label:'🍴 Forks'   },
  { value:'updated', label:'🕒 Recent'  },
];

function Sk({ h=12, w='100%', style={} }) {
  return <div className="skeleton" style={{ height:h, width:w, borderRadius:6, ...style }}/>;
}

function RepoCard({ repo }) {
  const stars = (repo.stargazers_count || repo.stars || 0).toLocaleString();
  const forks = (repo.forks_count || repo.forks || 0).toLocaleString();
  const lang = repo.language || repo.primaryLanguage;
  const name = repo.full_name || repo.fullName;
  const owner = repo.owner?.login;
  const avatar = repo.owner?.avatar_url || repo.owner?.avatarUrl;

  return (
    <a href={repo.url || repo.html_url} target="_blank" rel="noreferrer"
      style={{ display:'block', textDecoration:'none' }}
      className="slide-up">
      <div className="card" style={{
        height:'100%', display:'flex', flexDirection:'column', gap:'0.75rem',
        transition:'all 0.18s ease', cursor:'pointer',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--border-accent)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'none';
        }}>

        {/* Owner row */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
          {avatar && (
            <img src={avatar} alt={owner} style={{
              width:28, height:28, borderRadius:7, border:'1px solid var(--border-2)', flexShrink:0,
            }}/>
          )}
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ fontFamily:"'Fira Code',monospace", fontSize:'0.8rem', fontWeight:600,
              color:'var(--accent)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {name}
            </div>
            {owner && (
              <div style={{ fontSize:'0.65rem', color:'var(--text-3)' }}>by @{owner}</div>
            )}
          </div>
        </div>

        {/* Description */}
        {repo.description && (
          <p style={{
            fontSize:'0.78rem', color:'var(--text-2)', lineHeight:1.55, flex:1,
            display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
          }}>
            {repo.description}
          </p>
        )}

        {/* Meta */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap', marginTop:'auto' }}>
          {lang && (
            <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.7rem', color:'var(--text-2)' }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:langColor(lang),
                display:'inline-block', boxShadow:`0 0 5px ${langColor(lang)}80` }}/>
              {lang}
            </span>
          )}
          <span style={{ fontFamily:"'Fira Code',monospace", fontSize:'0.7rem', color:'var(--text-3)' }}>⭐ {stars}</span>
          <span style={{ fontFamily:"'Fira Code',monospace", fontSize:'0.7rem', color:'var(--text-3)' }}>🍴 {forks}</span>
          {repo.updated_at && (
            <span style={{ fontSize:'0.65rem', color:'var(--text-4)', marginLeft:'auto',
              fontFamily:"'Fira Code',monospace" }}>
              {new Date(repo.updated_at).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

function UserCard({ user }) {
  return (
    <a href={`https://github.com/${user.login}`} target="_blank" rel="noreferrer"
      style={{ display:'block', textDecoration:'none' }}
      className="slide-up">
      <div className="card" style={{ transition:'all 0.18s ease' }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--border-accent)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.transform = 'none';
        }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.875rem' }}>
          <img src={user.avatar_url} alt={user.login} style={{
            width:48, height:48, borderRadius:12,
            border:'2px solid var(--border-2)', flexShrink:0,
          }}/>
          <div style={{ flex:1, minWidth:0 }}>
            {user.name && (
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:'0.9rem', color:'var(--text)', marginBottom:1 }}>
                {user.name}
              </div>
            )}
            <div style={{ fontFamily:"'Fira Code',monospace", fontSize:'0.78rem', color:'var(--accent)', marginBottom:3 }}>
              @{user.login}
            </div>
            {user.bio && (
              <div style={{ fontSize:'0.72rem', color:'var(--text-3)',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {user.bio}
              </div>
            )}
          </div>
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div style={{ fontFamily:"'Fira Code',monospace", fontSize:'0.72rem', color:'var(--text-3)', marginBottom:2 }}>
              📦 {user.public_repos}
            </div>
            <div style={{ fontFamily:"'Fira Code',monospace", fontSize:'0.72rem', color:'var(--text-3)' }}>
              👥 {user.followers?.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}

/* ─── Skeleton card ─── */
function SkCard() {
  return (
    <div className="card" style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
      <div style={{ display:'flex', gap:'0.625rem', alignItems:'center' }}>
        <Sk h={28} w={28} style={{ borderRadius:7, flexShrink:0 }}/>
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'0.375rem' }}>
          <Sk h={11} w="65%"/>
          <Sk h={9} w="35%"/>
        </div>
      </div>
      <Sk h={10}/> <Sk h={10} w="75%"/>
      <Sk h={8} w="45%"/>
    </div>
  );
}

export default function DiscoverPage() {
  const [mode,    setMode]    = useState('repos');
  const [lang,    setLang]    = useState('JavaScript');
  const [keyword, setKeyword] = useState('');
  const [sort,    setSort]    = useState('stars');
  const [repos,   setRepos]   = useState([]);
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [page,    setPage]    = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async (reset = true) => {
    setLoading(true); setError('');
    const p = reset ? 1 : page;
    try {
      if (mode === 'repos') {
        const data = await api.searchRepos(lang, keyword, sort, p);
        const items = data.results || data.items || [];
        setRepos(prev => reset ? items : [...prev, ...items]);
        setHasMore(items.length >= 9);
      } else {
        const data = await api.searchUsers(lang, keyword, p);
        const items = data.results || data.items || [];
        setUsers(prev => reset ? items : [...prev, ...items]);
        setHasMore(items.length >= 9);
      }
      if (reset) setPage(1); else setPage(p+1);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [mode, lang, keyword, sort, page]);

  useEffect(() => { load(true); }, [mode, lang, sort]);

  const handleSearch = (e) => { e.preventDefault(); load(true); };
  const items = mode === 'repos' ? repos : users;

  return (
    <div className="fade-in" style={{ maxWidth:1120, margin:'0 auto', padding:'2rem 1.5rem' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom:'1.5rem' }}>
        <div style={{
          display:'inline-flex', alignItems:'center', gap:'0.5rem',
          padding:'0.3rem 0.875rem', borderRadius:100,
          background:'rgba(0,229,160,0.07)', border:'1px solid rgba(0,229,160,0.18)',
          marginBottom:'0.875rem',
        }}>
          <span style={{ fontSize:'0.7rem', color:'var(--emerald)', fontFamily:"'Fira Code',monospace", fontWeight:600, letterSpacing:'0.1em' }}>
            DISCOVER
          </span>
        </div>
        <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:'1.75rem', color:'var(--text)', letterSpacing:'-0.03em' }}>
          Explore the Ecosystem
        </h1>
        <p style={{ fontSize:'0.85rem', color:'var(--text-3)', marginTop:'0.25rem' }}>
          Trending repositories and top developers across every language
        </p>
      </div>

      {/* ── Filters ── */}
      <div className="card" style={{ marginBottom:'1.25rem', padding:'1.25rem' }}>
        {/* Mode toggle */}
        <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.125rem' }}>
          {[
            { id:'repos', label:'Repositories', icon:'⬚' },
            { id:'users', label:'Developers',   icon:'◉' },
          ].map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setPage(1); }}
              style={{
                padding:'0.45rem 1.125rem', borderRadius:8, fontSize:'0.82rem', fontWeight:600,
                cursor:'pointer', border:'1px solid', transition:'all 0.15s',
                fontFamily:"'Space Grotesk',sans-serif",
                background: mode===m.id ? 'var(--accent-dim)' : 'var(--card-2)',
                color: mode===m.id ? 'var(--accent)' : 'var(--text-3)',
                borderColor: mode===m.id ? 'var(--border-accent)' : 'var(--border)',
              }}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {/* Keyword search */}
        <form onSubmit={handleSearch} style={{ display:'flex', gap:'0.625rem', marginBottom:'1.125rem' }}>
          <div style={{ position:'relative', flex:1 }}>
            <span style={{
              position:'absolute', left:'0.875rem', top:'50%', transform:'translateY(-50%)',
              color:'var(--text-3)', fontSize:'0.85rem', pointerEvents:'none',
            }}>⊙</span>
            <input className="input" style={{ paddingLeft:'2.2rem' }}
              placeholder={mode==='repos' ? 'Search repositories… (e.g. machine learning, hooks)' : 'Search developers… (e.g. location:India)'}
              value={keyword} onChange={e => setKeyword(e.target.value)}/>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>Search</button>
          {keyword && (
            <button type="button" className="btn btn-secondary"
              onClick={() => { setKeyword(''); load(true); }}>
              Clear
            </button>
          )}
        </form>

        {/* Language chips */}
        <div style={{ marginBottom: mode==='repos' ? '1rem' : 0 }}>
          <div className="section-label">Language</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.375rem' }}>
            {LANGUAGES.map(l => (
              <button key={l} onClick={() => setLang(l)}
                style={{
                  padding:'0.28rem 0.8rem', borderRadius:100, fontSize:'0.72rem', fontWeight:600,
                  cursor:'pointer', border:'1px solid', transition:'all 0.15s',
                  fontFamily:"'Space Grotesk',sans-serif",
                  background: lang===l ? `${langColor(l)}18` : 'var(--surface-2)',
                  color: lang===l ? langColor(l) : 'var(--text-3)',
                  borderColor: lang===l ? `${langColor(l)}45` : 'var(--border)',
                  boxShadow: lang===l ? `0 0 10px ${langColor(l)}25` : 'none',
                }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        {mode==='repos' && (
          <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
            <span style={{ fontSize:'0.7rem', color:'var(--text-3)', fontFamily:"'Fira Code',monospace", letterSpacing:'0.08em' }}>SORT</span>
            {SORT_OPTIONS.map(s => (
              <button key={s.value} onClick={() => setSort(s.value)}
                style={{
                  padding:'0.25rem 0.75rem', borderRadius:7, fontSize:'0.72rem', fontWeight:600,
                  cursor:'pointer', border:'1px solid', transition:'all 0.15s',
                  background: sort===s.value ? 'var(--violet-dim)' : 'var(--surface-2)',
                  color: sort===s.value ? 'var(--violet)' : 'var(--text-3)',
                  borderColor: sort===s.value ? 'rgba(124,106,255,0.3)' : 'var(--border)',
                }}>
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding:'0.75rem 1rem', background:'var(--coral-dim)',
          border:'1px solid rgba(255,95,126,0.2)', borderRadius:10,
          fontSize:'0.82rem', color:'var(--coral)', marginBottom:'1rem' }}>
          ⚠ {error}
        </div>
      )}

      {/* Results count */}
      {!loading && items.length > 0 && (
        <div style={{ fontSize:'0.72rem', color:'var(--text-3)', marginBottom:'0.875rem',
          fontFamily:"'Fira Code',monospace", display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <span>Showing {items.length} {mode}</span>
          <span style={{ color:'var(--border-2)' }}>•</span>
          <span>filtered by <span style={{ color:'var(--accent)' }}>{keyword || lang}</span></span>
        </div>
      )}

      {/* Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'1rem' }}>
        {loading && items.length === 0
          ? [...Array(9)].map((_, i) => <SkCard key={i}/>)
          : items.map((item, i) =>
              mode === 'repos'
                ? <RepoCard key={item.id || i} repo={item}/>
                : <UserCard key={item.id || item.login || i} user={item}/>
            )
        }
      </div>

      {/* Empty */}
      {!loading && items.length === 0 && !error && (
        <div style={{ textAlign:'center', padding:'4rem 2rem' }}>
          <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>⊙</div>
          <div style={{ fontSize:'0.95rem', fontWeight:600, color:'var(--text-2)', marginBottom:'0.5rem' }}>No results found</div>
          <p style={{ fontSize:'0.82rem', color:'var(--text-3)' }}>Try a different keyword or language filter</p>
        </div>
      )}

      {/* Load more */}
      {!loading && items.length > 0 && hasMore && (
        <div style={{ textAlign:'center', marginTop:'1.5rem' }}>
          <button className="btn btn-secondary" onClick={() => load(false)} style={{ minWidth:140 }}>
            Load More ↓
          </button>
        </div>
      )}
      {loading && items.length > 0 && (
        <div style={{ textAlign:'center', marginTop:'1.5rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}>
          <div className="loading-dots"><span/><span/><span/></div>
          <span style={{ fontSize:'0.8rem', color:'var(--text-3)' }}>Loading more</span>
        </div>
      )}
    </div>
  );
}