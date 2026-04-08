'use client'

import type { PageId } from '@/types'

const DRAWER_PAGES: PageId[] = ['marketing','seo','team','rev-detail','margin-detail','ch-detail','prod-detail']

interface MobileNavProps {
  activePage: PageId
  setActivePage: (p: PageId) => void
  drawerOpen: boolean
  setDrawerOpen: (v: boolean) => void
}

export default function MobileNav({ activePage, setActivePage, drawerOpen, setDrawerOpen }: MobileNavProps) {
  function go(p: PageId) {
    setActivePage(p)
    setDrawerOpen(false)
  }

  const moreActive = DRAWER_PAGES.includes(activePage)

  return (
    <>
      <div className="mob-tab-bar">
        <button className={`mob-tab${activePage==='command'?' active':''}`} onClick={()=>go('command')}>
          <span className="mob-tab-icon">★</span><span className="mob-tab-lbl">Command</span>
        </button>
        <button className={`mob-tab${activePage==='growth'?' active':''}`} onClick={()=>go('growth')}>
          <span className="mob-tab-icon">↗</span><span className="mob-tab-lbl">Growth</span>
        </button>
        <button className={`mob-tab${activePage==='ops'?' active':''}`} onClick={()=>go('ops')}>
          <span className="mob-tab-icon">⚙</span><span className="mob-tab-lbl">Ops</span>
        </button>
        <button className={`mob-tab${activePage==='financial'?' active':''}`} onClick={()=>go('financial')}>
          <span className="mob-tab-icon">$</span><span className="mob-tab-lbl">Finance</span>
        </button>
        <button className={`mob-tab${moreActive?' active':''}`} onClick={()=>setDrawerOpen(!drawerOpen)}>
          <span className="mob-tab-icon">☰</span><span className="mob-tab-lbl">More</span>
        </button>
      </div>

      <div
        className={`mob-menu-overlay${drawerOpen?' open':''}`}
        onClick={() => setDrawerOpen(false)}
      />
      <div className={`mob-menu-drawer${drawerOpen?' open':''}`}>
        <div className="mob-menu-hd">More</div>
        <div className="mob-menu-section">Business</div>
        <button className={`mob-menu-item${activePage==='marketing'?' active':''}`} onClick={()=>go('marketing')}><span className="nav-icon">◎</span> Marketing</button>
        <button className={`mob-menu-item${activePage==='seo'?' active':''}`} onClick={()=>go('seo')}><span className="nav-icon">⟳</span> SEO</button>
        <div className="mob-menu-section">Leadership</div>
        <button className={`mob-menu-item${activePage==='team'?' active':''}`} onClick={()=>go('team')}><span className="nav-icon">◈</span> People &amp; Team</button>
        <div className="mob-menu-section">Deep Dive</div>
        <button className={`mob-menu-item${activePage==='rev-detail'?' active':''}`} onClick={()=>go('rev-detail')}><span className="nav-icon">↑</span> Revenue Detail</button>
        <button className={`mob-menu-item${activePage==='margin-detail'?' active':''}`} onClick={()=>go('margin-detail')}><span className="nav-icon">▲</span> Margin Detail</button>
        <button className={`mob-menu-item${activePage==='ch-detail'?' active':''}`} onClick={()=>go('ch-detail')}><span className="nav-icon">⇄</span> Channel Detail</button>
        <button className={`mob-menu-item${activePage==='prod-detail'?' active':''}`} onClick={()=>go('prod-detail')}><span className="nav-icon">⊙</span> Production Detail</button>
      </div>
    </>
  )
}
