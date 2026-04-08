'use client'

import { useState, useEffect } from 'react'
import type { DashboardData, PageId, Theme } from '@/types'
import Nav from './Nav'
import Topbar from './Topbar'
import MobileNav from './MobileNav'

// Pages
import CommandCentre from './pages/CommandCentre'
import SalesOverview from './pages/SalesOverview'
import Operations from './pages/Operations'
import FinancialControl from './pages/FinancialControl'
import SpendControl from './pages/SpendControl'
import Marketing from './pages/Marketing'
import SEO from './pages/SEO'
import PeopleTeam from './pages/PeopleTeam'
import RevenueDetail from './pages/RevenueDetail'
import MarginDetail from './pages/MarginDetail'
import ChannelDetail from './pages/ChannelDetail'
import ProductionDetail from './pages/ProductionDetail'

const PAGE_TITLES: Record<PageId, string> = {
  command: 'Command Centre',
  growth: 'Sales Overview',
  ops: 'Operations',
  financial: 'Financial Control',
  spend: 'Spend Control',
  marketing: 'Marketing',
  seo: 'SEO',
  team: 'People & Team',
  'rev-detail': 'Revenue Detail',
  'margin-detail': 'Margin Detail',
  'ch-detail': 'Channel Detail',
  'prod-detail': 'Production Detail',
}

const FILTER_PAGES: PageId[] = ['growth', 'rev-detail', 'ch-detail', 'prod-detail']

export default function Dashboard() {
  const [activePage, setActivePage] = useState<PageId>('command')
  const [theme, setTheme] = useState<Theme>('night')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterYear, setFilterYear] = useState<'fy26' | 'fy25'>('fy26')
  const [filterSkus, setFilterSkus] = useState<string[]>(['OG Large','ES Large','Chilli Egg Mayo','Hot Honey','PERi Crackle 1KG'])
  const [drawerOpen, setDrawerOpen] = useState(false)

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

  function cycleTheme() {
    const themes: Theme[] = ['night', 'day', 'dusk']
    setTheme(t => themes[(themes.indexOf(t) + 1) % themes.length])
  }

  const themeEmoji = theme === 'night' ? '🌙' : theme === 'day' ? '☀️' : '🌅'
  const themeLabel = theme === 'night' ? 'NIGHT' : theme === 'day' ? 'DAY' : 'DUSK'
  const showFilterBar = FILTER_PAGES.includes(activePage)

  if (loading) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#111',color:'#666',fontFamily:'Inter,sans-serif',fontSize:13}}>
        Loading…
      </div>
    )
  }

  const pages: Record<PageId, React.ReactNode> = {
    command: <CommandCentre data={data!} />,
    growth: <SalesOverview data={data!} filterYear={filterYear} />,
    ops: <Operations data={data!} />,
    financial: <FinancialControl data={data!} />,
    spend: <SpendControl data={data!} />,
    marketing: <Marketing data={data!} />,
    seo: <SEO data={data!} />,
    team: <PeopleTeam data={data!} />,
    'rev-detail': <RevenueDetail data={data!} filterYear={filterYear} />,
    'margin-detail': <MarginDetail />,
    'ch-detail': <ChannelDetail data={data!} filterYear={filterYear} />,
    'prod-detail': <ProductionDetail data={data!} filterSkus={filterSkus} />,
  }

  return (
    <>
      <Nav activePage={activePage} setActivePage={setActivePage} />

      <main>
        <Topbar
          title={PAGE_TITLES[activePage]}
          themeEmoji={themeEmoji}
          themeLabel={themeLabel}
          onCycleTheme={cycleTheme}
        />

        {showFilterBar && (
          <div className="filter-bar">
            <div className="fg">
              <span className="fgl">Year</span>
              <button
                className={`fchip${filterYear === 'fy26' ? ' active' : ''}`}
                onClick={() => setFilterYear('fy26')}
              >FY26</button>
              <button
                className={`fchip${filterYear === 'fy25' ? ' active' : ''}`}
                onClick={() => setFilterYear('fy25')}
              >FY25</button>
            </div>
            {activePage === 'prod-detail' && (
              <>
                <div className="fsep" />
                <div className="fg">
                  <span className="fgl">SKU</span>
                  {['OG Large','ES Large','Chilli Egg Mayo','Hot Honey','PERi Crackle 1KG'].map(sku => (
                    <button
                      key={sku}
                      className={`fchip${filterSkus.includes(sku) ? ' active' : ''}`}
                      onClick={() => {
                        setFilterSkus(prev =>
                          prev.includes(sku)
                            ? prev.length === 1 ? prev : prev.filter(s => s !== sku)
                            : [...prev, sku]
                        )
                      }}
                    >{sku === 'Chilli Egg Mayo' ? 'Egg Mayo' : sku === 'PERi Crackle 1KG' ? 'PERi Crackle' : sku}</button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="page">
          {pages[activePage]}
        </div>
      </main>

      <MobileNav
        activePage={activePage}
        setActivePage={setActivePage}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />
    </>
  )
}
