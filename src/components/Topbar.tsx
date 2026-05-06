'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

interface TopbarProps {
  title: string
  themeEmoji: string
  themeLabel: string
  onCycleTheme: () => void
  presenting: boolean
  onTogglePresenting: () => void
  userEmail: string
  onCreateTask?: () => void
  onSearch?: () => void
}

export default function Topbar({ title, themeEmoji, themeLabel, onCycleTheme, presenting, onTogglePresenting, userEmail, onCreateTask, onSearch }: TopbarProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
      {onSearch && (
        <button className="search-trigger" onClick={onSearch}>
          <span style={{ fontSize: 14 }}>⌕</span>
          <span>Search…</span>
          <span className="search-trigger-kbd">⌘K</span>
        </button>
      )}
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        {onCreateTask && (
          <button onClick={onCreateTask} style={{
            background: 'transparent', border: '1px solid #C0392B',
            color: '#C0392B', borderRadius: 6, padding: '4px 11px',
            cursor: 'pointer', fontSize: 11, fontFamily: "'VisbyRound', sans-serif",
            fontWeight: 700, letterSpacing: '0.06em',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#C0392B'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#C0392B' }}
          >
            + Task
          </button>
        )}
        <button
          onClick={onTogglePresenting}
          title={presenting ? 'Exit present mode' : 'Enter present mode — hides sensitive numbers'}
          style={{
            background: presenting ? 'rgba(230,126,34,0.15)' : 'transparent',
            border: `1px solid ${presenting ? '#E67E22' : 'var(--grey3)'}`,
            borderRadius: 6,
            padding: '4px 9px',
            cursor: 'pointer',
            fontSize: 11,
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            color: presenting ? '#E67E22' : 'var(--mid)',
            transition: 'all 0.2s ease',
          }}
        >
          {presenting ? '👁 presenting' : '🔒 private'}
        </button>
        <span id="theme-label">{themeLabel}</span>
        <button id="theme-btn" onClick={onCycleTheme} title="Toggle theme">{themeEmoji}</button>
        <button
          onClick={handleLogout}
          title={`Signed in as ${userEmail}`}
          style={{
            background: 'transparent',
            border: '1px solid var(--grey3)',
            borderRadius: 6,
            padding: '4px 9px',
            cursor: 'pointer',
            fontSize: 11,
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            color: 'var(--mid)',
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
