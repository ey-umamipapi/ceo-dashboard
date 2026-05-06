'use client'

import type { PageId, Role } from '@/types'

const DRAWER_PAGES: PageId[] = [
  'rev-detail','ch-detail','brand-comms','marketing','seo','socials','spend','margin-detail','team',
  'prod-overview','efficiency','run-log','inventory','costing','weekly-pulse','automations','board',
]

interface MobileNavProps {
  activePage: PageId
  setActivePage: (p: PageId) => void
  drawerOpen: boolean
  setDrawerOpen: (v: boolean) => void
  userRole: Role
}

export default function MobileNav({ activePage, setActivePage, drawerOpen, setDrawerOpen, userRole }: MobileNavProps) {
  function go(p: PageId) { setActivePage(p); setDrawerOpen(false) }
  const moreActive   = DRAWER_PAGES.includes(activePage)
  const isCeo        = userRole === 'ceo'
  const isGuest      = userRole === 'guest' || userRole === 'viewer'
  const showFinance  = !isGuest

  return (
    <>
      <div className="mob-tab-bar">
        {isCeo && (
          <button className={`mob-tab${activePage==='command'?' active':''}`} onClick={()=>go('command')}>
            <span className="mob-tab-icon">★</span><span className="mob-tab-lbl">Command</span>
          </button>
        )}
        <button className={`mob-tab${activePage==='growth'?' active':''}`} onClick={()=>go('growth')}>
          <span className="mob-tab-icon">↗</span><span className="mob-tab-lbl">Sales</span>
        </button>
        {showFinance && (
          <button className={`mob-tab${activePage==='financial'?' active':''}`} onClick={()=>go('financial')}>
            <span className="mob-tab-icon">$</span><span className="mob-tab-lbl">Finance</span>
          </button>
        )}
        <button className={`mob-tab${activePage==='prod-overview'?' active':''}`} onClick={()=>go('prod-overview')}>
          <span className="mob-tab-icon">⊙</span><span className="mob-tab-lbl">Ops</span>
        </button>
        <button className={`mob-tab${moreActive?' active':''}`} onClick={()=>setDrawerOpen(!drawerOpen)}>
          <span className="mob-tab-icon">☰</span><span className="mob-tab-lbl">More</span>
        </button>
      </div>

      <div className={`mob-menu-overlay${drawerOpen?' open':''}`} onClick={() => setDrawerOpen(false)} />
      <div className={`mob-menu-drawer${drawerOpen?' open':''}`}>
        <div className="mob-menu-hd">More</div>

        {isCeo && (
          <>
            <div className="mob-menu-section">CEO</div>
            <button className={`mob-menu-item${activePage==='weekly-pulse'?' active':''}`} onClick={()=>go('weekly-pulse')}><span className="nav-icon">◉</span> Weekly Pulse</button>
            <button className={`mob-menu-item${activePage==='automations'?' active':''}`}  onClick={()=>go('automations')}><span className="nav-icon">⚡</span> Automations</button>
            <button className={`mob-menu-item${activePage==='command'?' active':''}`}      onClick={()=>go('command')}><span className="nav-icon">★</span> Command Centre</button>
          </>
        )}

        <div className="mob-menu-section">Commercial</div>
        <button className={`mob-menu-item${activePage==='rev-detail'?' active':''}`}   onClick={()=>go('rev-detail')}><span className="nav-icon">↑</span> Revenue Detail</button>
        <button className={`mob-menu-item${activePage==='ch-detail'?' active':''}`}    onClick={()=>go('ch-detail')}><span className="nav-icon">⇄</span> Channel Detail</button>

        <div className="mob-menu-section">Marketing</div>
        <button className={`mob-menu-item${activePage==='brand-comms'?' active':''}`} onClick={()=>go('brand-comms')}><span className="nav-icon">◎</span> Brand &amp; Comms</button>
        <button className={`mob-menu-item${activePage==='marketing'?' active':''}`}    onClick={()=>go('marketing')}><span className="nav-icon">$</span> Paid Media</button>
        <button className={`mob-menu-item${activePage==='socials'?' active':''}`}      onClick={()=>go('socials')}><span className="nav-icon">◈</span> Socials</button>
        <button className={`mob-menu-item${activePage==='seo'?' active':''}`}          onClick={()=>go('seo')}><span className="nav-icon">⟳</span> SEO</button>

        {showFinance && (
          <>
            <div className="mob-menu-section">Finance</div>
            <button className={`mob-menu-item${activePage==='spend'?' active':''}`}        onClick={()=>go('spend')}><span className="nav-icon">⊟</span> Spend Control</button>
            <button className={`mob-menu-item${activePage==='margin-detail'?' active':''}`}onClick={()=>go('margin-detail')}><span className="nav-icon">▲</span> Margin Detail</button>
          </>
        )}

        <div className="mob-menu-section">People</div>
        <button className={`mob-menu-item${activePage==='team'?' active':''}`}         onClick={()=>go('team')}><span className="nav-icon">◈</span> People &amp; Team</button>

        <div className="mob-menu-section">Operations</div>
        <button className={`mob-menu-item${activePage==='efficiency'?' active':''}`}   onClick={()=>go('efficiency')}><span className="nav-icon">≋</span> Efficiency</button>
        <button className={`mob-menu-item${activePage==='run-log'?' active':''}`}      onClick={()=>go('run-log')}><span className="nav-icon">≡</span> Run Log</button>
        <button className={`mob-menu-item${activePage==='inventory'?' active':''}`}    onClick={()=>go('inventory')}><span className="nav-icon">▣</span> Inventory &amp; Batches</button>
        <button className={`mob-menu-item${activePage==='costing'?' active':''}`}      onClick={()=>go('costing')}><span className="nav-icon">◆</span> Costing Engine</button>

        <div className="mob-menu-section">Workspace</div>
        <button className={`mob-menu-item${activePage==='board'?' active':''}`}        onClick={()=>go('board')}><span className="nav-icon">◫</span> Task Board</button>
      </div>
    </>
  )
}
