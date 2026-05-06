'use client'

import Image from 'next/image'
import { SECTIONS, PAGE_TO_SECTION, visibleSections } from '@/lib/nav'
import type { PageId, Role } from '@/types'

interface Props {
  activePage: PageId
  setActivePage: (p: PageId) => void
  userRole: Role
}

export default function SectionBar({ activePage, setActivePage, userRole }: Props) {
  const activeSection = PAGE_TO_SECTION[activePage]
  const sections = visibleSections(userRole)

  function goSection(sectionId: string) {
    const section = SECTIONS.find(s => s.id === sectionId)
    if (section) setActivePage(section.defaultPage)
  }

  return (
    <div className="section-bar">
      <div className="section-bar-logo" onClick={() => goSection('ceo')} style={{ cursor: 'pointer' }}>
        <Image src="/chilli.png" alt="UmamiPapi" width={20} height={19} style={{ flexShrink: 0 }} />
        <span className="section-bar-wordmark">HubPapi</span>
      </div>
      <div className="section-bar-divider" />
      {sections.map(s => (
        <button
          key={s.id}
          className={`section-tab${activeSection === s.id ? ' active' : ''}`}
          onClick={() => goSection(s.id)}
        >
          {s.label}
        </button>
      ))}
      <div style={{ marginLeft: 'auto' }} />
      <button
        className={`section-tab${activePage === 'settings' ? ' active' : ''}`}
        onClick={() => setActivePage('settings')}
        title="Settings"
        style={{ fontSize: 15 }}
      >
        ⚙
      </button>
    </div>
  )
}
