import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const LINKS = [
  { to: '/',            label: 'Profile',     icon: '◉', desc: 'Analyze developer' },
  { to: '/compare',     label: 'Compare',     icon: '⇌', desc: 'Side by side'      },
  { to: '/discover',    label: 'Discover',    icon: '⊙', desc: 'Explore repos'     },
  { to: '/leaderboard', label: 'Leaderboard', icon: '◈', desc: 'Global rankings'   },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'all 0.3s ease',
      background: scrolled
        ? 'rgba(5,8,16,0.92)'
        : 'rgba(5,8,16,0.7)',
      backdropFilter: 'blur(20px) saturate(1.8)',
      WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
      borderBottom: scrolled
        ? '1px solid rgba(255,255,255,0.08)'
        : '1px solid rgba(255,255,255,0.04)',
      boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none',
    }}>
      <div style={{
        maxWidth: 1120,
        margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 58,
      }}>

        {/* ── Logo ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Icon mark */}
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,106,255,0.2))',
            border: '1px solid rgba(0,212,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            flexShrink: 0,
            boxShadow: '0 0 15px rgba(0,212,255,0.15)',
          }}>
            🔭
          </div>
          <div>
            <div style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: '1.05rem',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              color: 'var(--text)',
            }}>
              Dev<span style={{ color: 'var(--accent)' }}>Lens</span>
            </div>
            <div style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: '0.55rem',
              color: 'var(--text-3)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginTop: 1,
            }}>
              PRO ANALYTICS
            </div>
          </div>
        </div>

        {/* ── Nav Links ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.9rem',
                borderRadius: 8,
                fontSize: '0.82rem',
                fontWeight: 600,
                fontFamily: "'Space Grotesk', sans-serif",
                textDecoration: 'none',
                transition: 'all 0.18s ease',
                letterSpacing: '0.01em',
                position: 'relative',
                background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-3)',
                border: isActive ? '1px solid rgba(0,212,255,0.18)' : '1px solid transparent',
                boxShadow: isActive ? '0 0 12px rgba(0,212,255,0.1)' : 'none',
              })}>
              <span style={{ fontSize: '0.72rem', opacity: 0.9 }}>{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* ── Right side ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {/* Live indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.3rem 0.7rem',
            background: 'rgba(0,229,160,0.06)',
            border: '1px solid rgba(0,229,160,0.15)',
            borderRadius: 100,
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--emerald)',
              boxShadow: '0 0 6px var(--emerald)',
              animation: 'pulse-glow 2s infinite',
              display: 'block',
            }}/>
            <span style={{
              fontSize: '0.65rem',
              fontFamily: "'Fira Code', monospace",
              fontWeight: 600,
              color: 'var(--emerald)',
              letterSpacing: '0.08em',
            }}>
              LIVE
            </span>
          </div>

          {/* GitHub link */}
          <a href="https://github.com" target="_blank" rel="noreferrer"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--card-2)',
              border: '1px solid var(--border-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              textDecoration: 'none',
              transition: 'all 0.15s',
              color: 'var(--text-3)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border-accent)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-2)';
              e.currentTarget.style.color = 'var(--text-3)';
            }}>
            ⬡
          </a>
        </div>
      </div>
    </nav>
  );
}