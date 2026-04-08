'use client'

interface TopbarProps {
  title: string
  themeEmoji: string
  themeLabel: string
  onCycleTheme: () => void
}

export default function Topbar({ title, themeEmoji, themeLabel, onCycleTheme }: TopbarProps) {
  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
      <div style={{display:'flex',alignItems:'center',gap:14}}>
        <span id="theme-label">{themeLabel}</span>
        <button id="theme-btn" onClick={onCycleTheme} title="Toggle theme">{themeEmoji}</button>
        <div className="topbar-meta">FY26 · Jul–Apr MTD · YoY comparison active</div>
      </div>
    </div>
  )
}
