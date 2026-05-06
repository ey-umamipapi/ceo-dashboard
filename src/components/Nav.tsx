'use client'

import { SECTIONS, PAGE_TO_SECTION, visiblePages } from '@/lib/nav'
import type { PageId, Role } from '@/types'

interface Props {
  activePage: PageId
  setActivePage: (p: PageId) => void
  userRole: Role
}

export default function Nav({ activePage, setActivePage, userRole }: Props) {
  const activeSection = PAGE_TO_SECTION[activePage]
  const section = SECTIONS.find(s => s.id === activeSection)

  if (!section) {
    return (
      <nav>
        <div className="nav-section" style={{ marginTop: 8 }}>Account</div>
      </nav>
    )
  }

  const pages = visiblePages(section, userRole)

  return (
    <nav>
      <div className="nav-section" style={{ marginTop: 8 }}>{section.label}</div>
      {pages.map(page => (
        <button
          key={page.id}
          className={`nav-item${activePage === page.id ? ' active' : ''}`}
          onClick={() => setActivePage(page.id)}
        >
          <span className="nav-icon">{page.icon}</span>
          {page.label}
        </button>
      ))}
      <div style={{ marginTop: 'auto' }} />
      <div className="nav-footer">FY26 · May 2026 MTD</div>
    </nav>
  )
}
