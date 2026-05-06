import type { PageId, Role } from '@/types'

export type SectionId = 'ceo' | 'commercial' | 'marketing' | 'finance' | 'people' | 'ops' | 'workspace'

export interface NavPage {
  id: PageId
  icon: string
  label: string
  hideForGuest?: boolean
}

export interface NavSection {
  id: SectionId
  label: string
  icon: string
  defaultPage: PageId
  pages: NavPage[]
  ceoOnly?: boolean
  hideForGuest?: boolean
}

export const SECTIONS: NavSection[] = [
  {
    id: 'ceo',
    label: 'CEO',
    icon: '★',
    defaultPage: 'command',
    ceoOnly: true,
    pages: [
      { id: 'command',      icon: '★', label: 'Command Centre' },
      { id: 'weekly-pulse', icon: '◉', label: 'Weekly Pulse' },
      { id: 'automations',  icon: '⚡', label: 'Automations' },
    ],
  },
  {
    id: 'commercial',
    label: 'Commercial',
    icon: '↗',
    defaultPage: 'growth',
    pages: [
      { id: 'growth',     icon: '↗', label: 'Sales Overview' },
      { id: 'rev-detail', icon: '↑', label: 'Revenue Detail', hideForGuest: true },
      { id: 'ch-detail',  icon: '⇄', label: 'Channel Detail', hideForGuest: true },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: '◎',
    defaultPage: 'brand-comms',
    pages: [
      { id: 'brand-comms', icon: '◎', label: 'Brand & Comms' },
      { id: 'marketing',   icon: '$', label: 'Paid Media' },
      { id: 'socials',     icon: '◈', label: 'Socials' },
      { id: 'seo',         icon: '⟳', label: 'SEO' },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: '$',
    defaultPage: 'financial',
    hideForGuest: true,
    pages: [
      { id: 'financial',     icon: '$', label: 'Financial Control' },
      { id: 'spend',         icon: '⊟', label: 'Spend Control' },
      { id: 'margin-detail', icon: '▲', label: 'Margin Detail' },
    ],
  },
  {
    id: 'people',
    label: 'People',
    icon: '◈',
    defaultPage: 'team',
    pages: [
      { id: 'team', icon: '◈', label: 'People & Team' },
    ],
  },
  {
    id: 'ops',
    label: 'Ops',
    icon: '⊙',
    defaultPage: 'prod-overview',
    pages: [
      { id: 'prod-overview', icon: '⊙', label: 'Production Overview' },
      { id: 'efficiency',    icon: '≋', label: 'Efficiency' },
      { id: 'run-log',       icon: '≡', label: 'Run Log' },
      { id: 'inventory',     icon: '▣', label: 'Inventory & Batches' },
      { id: 'costing',       icon: '◆', label: 'Costing Engine' },
    ],
  },
  {
    id: 'workspace',
    label: 'Workspace',
    icon: '◫',
    defaultPage: 'board',
    pages: [
      { id: 'board', icon: '◫', label: 'Task Board' },
    ],
  },
]

// Map every PageId → its SectionId
export const PAGE_TO_SECTION: Partial<Record<PageId, SectionId>> = {}
for (const section of SECTIONS) {
  for (const page of section.pages) {
    PAGE_TO_SECTION[page.id] = section.id
  }
}

export function visibleSections(role: Role): NavSection[] {
  const isCeo   = role === 'ceo'
  const isGuest = role === 'guest' || role === 'viewer'
  return SECTIONS.filter(s => {
    if (s.ceoOnly && !isCeo) return false
    if (s.hideForGuest && isGuest) return false
    return true
  })
}

export function visiblePages(section: NavSection, role: Role): NavPage[] {
  const isGuest = role === 'guest' || role === 'viewer'
  return section.pages.filter(p => !p.hideForGuest || !isGuest)
}
