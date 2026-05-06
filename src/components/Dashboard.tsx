'use client'

import { useState, useEffect, useCallback } from 'react'
import type { DashboardData, PageId, Theme, Role, TaskDepartment } from '@/types'
import Nav from './Nav'
import SectionBar from './SectionBar'
import Topbar from './Topbar'
import MobileNav from './MobileNav'
import CreateTaskModal from './CreateTaskModal'

// Pages
import CommandCentre from './pages/CommandCentre'
import SalesOverview from './pages/SalesOverview'
import FinancialControl from './pages/FinancialControl'
import SpendControl from './pages/SpendControl'
import Marketing from './pages/Marketing'
import SEO from './pages/SEO'
import PeopleTeam from './pages/PeopleTeam'
import RevenueDetail from './pages/RevenueDetail'
import MarginDetail from './pages/MarginDetail'
import ChannelDetail from './pages/ChannelDetail'
import ProductionOverview from './pages/ProductionOverview'
import Efficiency from './pages/Efficiency'
import RunLog from './pages/RunLog'
import CostingDetail from './pages/CostingDetail'
import InventoryDetail from './pages/InventoryDetail'
import SettingsDetail from './pages/SettingsDetail'
import WeeklyPulse from './pages/WeeklyPulse'
import Automations from './pages/Automations'
import Board from './pages/Board'
import Socials from './pages/Socials'
import BrandComms from './pages/BrandComms'
import LoadingScreen from './LoadingScreen'
import GlobalSearch from './GlobalSearch'

const PAGE_TITLES: Record<PageId, string> = {
  command:        'Command Centre',
  growth:         'Sales Overview',
  financial:      'Financial Control',
  spend:          'Spend Control',
  marketing:      'Marketing',
  seo:            'SEO',
  team:           'People & Team',
  'rev-detail':   'Revenue Detail',
  'margin-detail':'Margin Detail',
  'ch-detail':    'Channel Detail',
  'prod-overview':'Production Overview',
  'efficiency':   'Efficiency',
  'run-log':      'Run Log',
  'costing':      'Costing Engine',
  'inventory':    'Inventory & Batches',
  'settings':     'Settings',
  'weekly-pulse': 'CEO Weekly Pulse',
  'automations':  'Automations',
  'board':        'Task Board',
  'socials':      'Social Media',
  'brand-comms':  'Brand & Comms',
}

// Maps page → task department for context-aware task creation
const PAGE_DEPT: Partial<Record<PageId, TaskDepartment>> = {
  command: 'ceo', 'weekly-pulse': 'ceo', automations: 'ceo',
  growth: 'commercial', 'rev-detail': 'commercial', 'ch-detail': 'commercial',
  marketing: 'marketing', seo: 'marketing', socials: 'marketing', 'brand-comms': 'marketing',
  financial: 'finance', spend: 'finance', 'margin-detail': 'finance',
  team: 'people',
  'prod-overview': 'ops', efficiency: 'ops', 'run-log': 'ops', inventory: 'ops', costing: 'ops',
}

const FILTER_PAGES: PageId[] = ['growth', 'rev-detail', 'ch-detail']

export default function Dashboard({ userEmail, userRole }: { userEmail: string; userRole: Role }) {
  const [activePage, setActivePage] = useState<PageId>('command')
  const [theme, setTheme] = useState<Theme>('night')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterYear, setFilterYear] = useState<'fy26' | 'fy25'>('fy26')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [presenting, setPresenting] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [taskModalDept, setTaskModalDept] = useState<TaskDepartment | undefined>()
  const [boardKey, setBoardKey] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(s => !s) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const openCreateTask = useCallback((ctx?: { department?: TaskDepartment }) => {
    setTaskModalDept(ctx?.department ?? PAGE_DEPT[activePage])
    setTaskModalOpen(true)
  }, [activePage])

  useEffect(() => {
    fetch('/api/data')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('up_theme') as Theme | null
    if (saved) setTheme(saved)
  }, [])

  useEffect(() => {
    const themes: Theme[] = ['night', 'day', 'dusk']
    const attr = theme === 'night' ? '' : theme
    document.documentElement.setAttribute('data-theme', attr)
    localStorage.setItem('up_theme', theme)
  }, [theme])

  useEffect(() => {
    if (presenting) {
      document.documentElement.setAttribute('data-presenting', '')
    } else {
      document.documentElement.removeAttribute('data-presenting')
    }
  }, [presenting])

  function cycleTheme() {
    const themes: Theme[] = ['night', 'day', 'dusk']
    setTheme(t => themes[(themes.indexOf(t) + 1) % themes.length])
  }

  const themeEmoji = theme === 'night' ? '🌙' : theme === 'day' ? '☀️' : '🌅'
  const themeLabel = theme === 'night' ? 'NIGHT' : theme === 'day' ? 'DAY' : 'DUSK'
  const showFilterBar = FILTER_PAGES.includes(activePage)

  if (loading) {
    return <LoadingScreen />
  }

  const pages: Record<PageId, React.ReactNode> = {
    command:        <CommandCentre data={data!} />,
    growth:         <SalesOverview data={data!} filterYear={filterYear} />,
    financial:      <FinancialControl data={data!} />,
    spend:          <SpendControl data={data!} />,
    marketing:      <Marketing data={data!} />,
    seo:            <SEO data={data!} />,
    team:           <PeopleTeam data={data!} />,
    'rev-detail':   <RevenueDetail data={data!} filterYear={filterYear} />,
    'margin-detail':<MarginDetail data={data!} />,
    'ch-detail':    <ChannelDetail data={data!} filterYear={filterYear} />,
    'prod-overview':<ProductionOverview data={data!} />,
    'efficiency':   <Efficiency data={data!} />,
    'run-log':      <RunLog data={data!} />,
    'costing':      <CostingDetail data={data!} />,
    'inventory':    <InventoryDetail data={data!} />,
    'settings':     <SettingsDetail userEmail={userEmail} />,
    'weekly-pulse': <WeeklyPulse />,
    'automations':  <Automations />,
    'board':        <Board key={boardKey} userRole={userRole} userEmail={userEmail} onCreateTask={openCreateTask} />,
    'socials':      <Socials data={data!} />,
    'brand-comms':  <BrandComms />,
  }

  return (
    <>
      <SectionBar activePage={activePage} setActivePage={setActivePage} userRole={userRole} />

      <div className="app-body">
      <Nav activePage={activePage} setActivePage={setActivePage} userRole={userRole} />

      <main>
        <Topbar
          title={PAGE_TITLES[activePage]}
          themeEmoji={themeEmoji}
          themeLabel={themeLabel}
          onCycleTheme={cycleTheme}
          presenting={presenting}
          onTogglePresenting={() => setPresenting(p => !p)}
          userEmail={userEmail}
          onCreateTask={() => openCreateTask()}
          onSearch={() => setSearchOpen(true)}
        />

        {showFilterBar && (
          <div className="filter-bar">
            <div className="fg">
              <span className="fgl">Year</span>
              <button className={`fchip${filterYear === 'fy26' ? ' active' : ''}`} onClick={() => setFilterYear('fy26')}>FY26</button>
              <button className={`fchip${filterYear === 'fy25' ? ' active' : ''}`} onClick={() => setFilterYear('fy25')}>FY25</button>
            </div>
          </div>
        )}

        <div className="page">
          {pages[activePage]}
        </div>
      </main>

      </div>

      <MobileNav
        activePage={activePage}
        setActivePage={setActivePage}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        userRole={userRole}
      />

      <GlobalSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        setActivePage={setActivePage}
        userRole={userRole}
        data={data ?? undefined}
      />

      <CreateTaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onCreated={() => { setTaskModalOpen(false); setBoardKey(k => k + 1) }}
        defaultDepartment={taskModalDept}
      />
    </>
  )
}
