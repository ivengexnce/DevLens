import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

const LANG_COLORS = {
  JavaScript:'#f7df1e',TypeScript:'#3178c6',Python:'#3572A5',Go:'#00ADD8',
  Rust:'#dea584',Java:'#b07219','C++':'#f34b7d',Ruby:'#701516',Swift:'#F05138',
  Kotlin:'#A97BFF',Vue:'#41b883',CSS:'#563d7c',HTML:'#e34c26',Shell:'#89e051',
};
const langColor = l => LANG_COLORS[l] || '#6b7280';

const LANGUAGES = ['JavaScript','TypeScript','Python','Go','Rust','Java','C++','Ruby','Swift','Kotlin'];
const SORT_OPTIONS = [
  { value:'stars',    label:'⭐ Most Stars'   },
  { value:'forks',    label:'🍴 Most Forks'   },
  { value:'updated',  label:'🕒 Recently Updated' },
];

function Skeleton({ h=12, w='100%', style={} }) {
  return <div className="skeleton" style={{ height:h, width:w, ...style }}/>;
}

function RepoCard({ repo }) {
  return (
    <a href={repo.url || repo.html_url} target="_blank" rel="noreferrer"
      className="card" style={{ display:'block', textDecoration:'none', transition:'border-color 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor='var(--border2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
      {/* owner */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'0.625rem' }}>
        <img src={repo.owner?.avatar_url || repo.owner?.avatarUrl} alt=""
          style={{ width:28, height:28, borderRadius:'50%', border:'1px solid var(--border2)' }}/>
        <div style={{ minWidth:0 }}>
          <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.82rem', fontWeight:700,
            color:'var(--info)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {repo.full_name || repo.fullName}
          </div>
          <div style={{ fontSize:'0.65rem', color:'var(--muted)' }}>{repo.owner?.login}</div>
        </div>
      </div>
      {repo.description && (
        <p style={{ fontSize:'0.76rem', color:'var(--text2)', lineHeight:1.5, marginBottom:'0.625rem',
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {repo.description}
        </p>
      )}
      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
        {(repo.language || repo.primaryLanguage) && (
          <span style={{ display:'flex', alignItems:'center', gap:3, fontSize:'0.7rem', color:'var(--text2)' }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:langColor(repo.language||repo.primaryLanguage), display:'inline-block' }}/>
            {repo.language || repo.primaryLanguage}
          </span>
        )}
        <span style={{ fontSize:'0.7rem', color:'var(--muted)' }}>⭐ {((repo.stargazers_count||repo.stars)||0).toLocaleString()}</span>
        <span style={{ fontSize:'0.7rem', color:'var(--muted)' }}>🍴 {((repo.forks_count||repo.forks)||0).toLocaleString()}</span>
        {repo.updated_at && (
          <span style={{ fontSize:'0.65rem', color:'var(--dim)', marginLeft:'auto' }}>
            {new Date(repo.updated_at).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
          </span>
        )}
      </div>
    </a>
  );
}

function UserCard({ user }) {
  return (
    <a href={`https://github.com/${user.login}`} target="_blank" rel="noreferrer"
      className="card" style={{ display:'block', textDecoration:'none', transition:'border-color 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor='var(--border2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
      <div style={{ display:'flex', alignItems:'center', gap:'0.875rem' }}>
        <img src={user.avatar_url} alt={user.login}
          style={{ width:44, height:44, borderRadius:'50%', border:'2px solid var(--border2)', flexShrink:0 }}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.85rem', fontWeight:700, color:'var(--info)' }}>
            @{user.login}
          </div>
          {user.name && <div style={{ fontSize:'0.75rem', color:'var(--text2)' }}>{user.name}</div>}
          {user.bio && <div style={{ fontSize:'0.7rem', color:'var(--muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:200 }}>{user.bio}</div>}
        </div>
        <div style={{ textAlign:'right', flexShrink:0 }}>
          <div style={{ fontSize:'0.7rem', color:'var(--muted)' }}>📦 {user.public_repos}</div>
          <div style={{ fontSize:'0.7rem', color:'var(--muted)' }}>👥 {user.followers}</div>
        </div>
      </div>
    </a>
  );
}

export default function DiscoverPage() {
  const [mode,      setMode]     = useState('repos');  // 'repos' | 'users'
  const [lang,      setLang]     = useState('JavaScript');
  const [keyword,   setKeyword]  = useState('');
  const [sort,      setSort]     = useState('stars');
  const [repos,     setRepos]    = useState([]);
  const [users,     setUsers]    = useState([]);
  const [loading,   setLoading]  = useState(false);
  const [error,     setError]    = useState('');
  const [page,      setPage]     = useState(1);
  const [hasMore,   setHasMore]  = useState(true);

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
      if (reset) setPage(1);
      else setPage(p+1);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [mode, lang, keyword, sort, page]);

  // Auto-load on mode/lang/sort change
  useEffect(() => { load(true); }, [mode, lang, sort]);

  function handleKeywordSearch(e) {
    e.preventDefault();
    load(true);
  }

  const items = mode === 'repos' ? repos : users;

  return (
    <div className="fade-in" style={{ maxWidth:1100, margin:'0 auto', padding:'1.5rem 1.25rem' }}>

      {/* Header */}
      <div className="card" style={{ marginBottom:'1.25rem' }}>
        <div className="section-label">⊕ Discover</div>

        {/* Mode toggle */}
        <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1rem' }}>
          {[
            { id:'repos', label:'📦 Repositories' },
            { id:'users', label:'👤 Developers'   },
          ].map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setPage(1); }}
              style={{ padding:'0.45rem 1rem', borderRadius:7, fontSize:'0.8rem', fontWeight:700,
                cursor:'pointer', border:'1px solid', transition:'all 0.15s',
                background: mode===m.id ? 'rgba(87,229,160,0.12)' : 'var(--card2)',
                color: mode===m.id ? 'var(--accent)' : 'var(--muted)',
                borderColor: mode===m.id ? 'rgba(87,229,160,0.3)' : 'var(--border)' }}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Keyword search */}
        <form onSubmit={handleKeywordSearch} style={{ display:'flex', gap:'0.625rem', marginBottom:'1rem' }}>
          <input className="input" placeholder={mode==='repos' ? 'Search repositories… (e.g. machine learning, react hooks)' : 'Search developers… (e.g. location:India, followers:>1000)'}
            value={keyword} onChange={e => setKeyword(e.target.value)}/>
          <button className="btn btn-primary" type="submit" disabled={loading}>Search</button>
          <button type="button" className="btn btn-secondary" onClick={() => { setKeyword(''); load(true); }}>Clear</button>
        </form>

        {/* Language chips */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.375rem', marginBottom: mode==='repos' ? '0.875rem' : 0 }}>
          <div className="section-label" style={{ width:'100%', marginBottom:'0.4rem' }}>Filter by Language</div>
          {LANGUAGES.map(l => (
            <button key={l} onClick={() => setLang(l)}
              style={{ padding:'0.25rem 0.75rem', borderRadius:20, fontSize:'0.72rem', fontWeight:600,
                cursor:'pointer', border:'1px solid', transition:'all 0.15s',
                background: lang===l ? `${langColor(l)}22` : 'var(--card2)',
                color: lang===l ? langColor(l) : 'var(--muted)',
                borderColor: lang===l ? `${langColor(l)}55` : 'var(--border)' }}>
              {l}
            </button>
          ))}
        </div>

        {/* Sort (repos only) */}
        {mode === 'repos' && (
          <div style={{ display:'flex', gap:'0.375rem', marginTop:'0.75rem' }}>
            <div className="section-label" style={{ alignSelf:'center', marginBottom:0, marginRight:'0.25rem' }}>Sort:</div>
            {SORT_OPTIONS.map(s => (
              <button key={s.value} onClick={() => setSort(s.value)}
                style={{ padding:'0.25rem 0.75rem', borderRadius:6, fontSize:'0.72rem', fontWeight:600,
                  cursor:'pointer', border:'1px solid', transition:'all 0.15s',
                  background: sort===s.value ? 'rgba(124,106,255,0.12)' : 'var(--card2)',
                  color: sort===s.value ? 'var(--accent2)' : 'var(--muted)',
                  borderColor: sort===s.value ? 'rgba(124,106,255,0.3)' : 'var(--border)' }}>
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding:'0.75rem 1rem', background:'rgba(255,95,126,0.08)',
          border:'1px solid rgba(255,95,126,0.2)', borderRadius:8,
          fontSize:'0.82rem', color:'var(--accent3)', marginBottom:'1rem' }}>
          {error}
        </div>
      )}

      {/* Results count */}
      {!loading && items.length > 0 && (
        <div style={{ fontSize:'0.72rem', color:'var(--muted)', marginBottom:'0.75rem', fontFamily:'JetBrains Mono,monospace' }}>
          Showing {items.length} {mode} for <span style={{ color:'var(--accent)' }}>{keyword || lang}</span>
        </div>
      )}

      {/* Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:'0.875rem' }}>
        {loading && items.length === 0
          ? [...Array(9)].map((_,i) => (
              <div key={i} className="card" style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                <div style={{ display:'flex', gap:'0.625rem' }}>
                  <Skeleton h={36} w={36} style={{ borderRadius:'50%', flexShrink:0 }}/>
                  <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                    <Skeleton h={12} w="60%"/><Skeleton h={10} w="40%"/>
                  </div>
                </div>
                <Skeleton h={10}/><Skeleton h={10} w="75%"/>
                <Skeleton h={8} w="50%"/>
              </div>
            ))
          : items.map((item, i) =>
              mode === 'repos'
                ? <RepoCard key={item.id || i} repo={item}/>
                : <UserCard key={item.id || item.login || i} user={item}/>
            )
        }
      </div>

      {/* Empty */}
      {!loading && items.length === 0 && !error && (
        <div style={{ textAlign:'center', padding:'3rem 1rem' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>🔍</div>
          <div style={{ fontSize:'0.9rem', color:'var(--muted)' }}>No results found. Try a different keyword or language.</div>
        </div>
      )}

      {/* Load more */}
      {!loading && items.length > 0 && hasMore && (
        <div style={{ textAlign:'center', marginTop:'1.25rem' }}>
          <button className="btn btn-secondary" onClick={() => load(false)}>Load More</button>
        </div>
      )}
      {loading && items.length > 0 && (
        <div style={{ textAlign:'center', marginTop:'1.25rem', color:'var(--muted)', fontSize:'0.8rem' }}>
          Loading more…
        </div>
      )}
    </div>
  );
}