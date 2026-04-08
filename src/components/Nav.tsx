'use client'

import type { PageId } from '@/types'

interface NavProps {
  activePage: PageId
  setActivePage: (p: PageId) => void
}

function NavItem({ id, icon, label, active, onClick }: {
  id: PageId; icon: string; label: string; active: boolean; onClick: () => void
}) {
  return (
    <button className={`nav-item${active ? ' active' : ''}`} onClick={onClick}>
      <span className="nav-icon">{icon}</span>
      {label}
    </button>
  )
}

export default function Nav({ activePage, setActivePage }: NavProps) {
  const go = (p: PageId) => setActivePage(p)
  return (
    <nav>
      <div className="nav-logo">
        <div className="nav-wordmark">UmamiPapi</div>
        <div className="nav-sub">CEO Dashboard · FY26</div>
      </div>

      <NavItem id="command" icon="★" label="Command Centre" active={activePage==='command'} onClick={()=>go('command')} />

      <div className="nav-section">Business</div>
      <NavItem id="growth" icon="↗" label="Sales Overview" active={activePage==='growth'} onClick={()=>go('growth')} />
      <NavItem id="ops" icon="⚙" label="Operations" active={activePage==='ops'} onClick={()=>go('ops')} />
      <NavItem id="financial" icon="$" label="Financial Control" active={activePage==='financial'} onClick={()=>go('financial')} />
      <NavItem id="spend" icon="⊟" label="Spend Control" active={activePage==='spend'} onClick={()=>go('spend')} />
      <NavItem id="marketing" icon="◎" label="Marketing" active={activePage==='marketing'} onClick={()=>go('marketing')} />
      <NavItem id="seo" icon="⟳" label="SEO" active={activePage==='seo'} onClick={()=>go('seo')} />

      <div className="nav-section">Leadership</div>
      <NavItem id="team" icon="◈" label="People & Team" active={activePage==='team'} onClick={()=>go('team')} />

      <div className="nav-section">Deep Dive</div>
      <NavItem id="rev-detail" icon="↑" label="Revenue Detail" active={activePage==='rev-detail'} onClick={()=>go('rev-detail')} />
      <NavItem id="margin-detail" icon="▲" label="Margin Detail" active={activePage==='margin-detail'} onClick={()=>go('margin-detail')} />
      <NavItem id="ch-detail" icon="⇄" label="Channel Detail" active={activePage==='ch-detail'} onClick={()=>go('ch-detail')} />
      <NavItem id="prod-detail" icon="⊙" label="Production Detail" active={activePage==='prod-detail'} onClick={()=>go('prod-detail')} />

      <div className="nav-footer">FY26 · Apr 2026 MTD</div>
    </nav>
  )
}
