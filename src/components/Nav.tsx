'use client'

import Image from 'next/image'
import type { PageId, Role } from '@/types'

interface NavProps {
  activePage: PageId
  setActivePage: (p: PageId) => void
  userRole: Role
  onGoToBoard?: () => void
}

function NavItem({ icon, label, active, onClick, disabled }: {
  id?: PageId; icon: string; label: string; active: boolean; onClick: () => void; disabled?: boolean
}) {
  return (
    <button className={`nav-item${active ? ' active' : ''}`} onClick={onClick} disabled={disabled}>
      <span className="nav-icon">{icon}</span>
      {label}
    </button>
  )
}

export default function Nav({ activePage, setActivePage, userRole, onGoToBoard }: NavProps) {
  const go = (p: PageId) => setActivePage(p)
  const isCeo   = userRole === 'ceo'
  const isGuest = userRole === 'guest' || userRole === 'viewer'
  const showFinance = !isGuest

  return (
    <nav>
      <div className="nav-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 2 }}>
          <Image src="/chilli.png" alt="UmamiPapi" width={24} height={22} style={{ flexShrink: 0 }} />
          <div className="nav-wordmark">HubPapi</div>
        </div>
        <div className="nav-sub">UmamiPapi · FY26</div>
      </div>

      {isCeo && (
        <>
          <div className="nav-section">CEO</div>
          <NavItem icon="★" label="Command Centre" active={activePage==='command'} onClick={()=>go('command')} />
          <NavItem icon="◉" label="Weekly Pulse"   active={activePage==='weekly-pulse'} onClick={()=>go('weekly-pulse')} />
          <NavItem icon="⚡" label="Automations"   active={activePage==='automations'}  onClick={()=>go('automations')} />
        </>
      )}

      <div className="nav-section">Commercial</div>
      <NavItem icon="↗" label="Sales Overview"  active={activePage==='growth'}      onClick={()=>go('growth')} />
      {showFinance && <NavItem icon="↑" label="Revenue Detail"  active={activePage==='rev-detail'}  onClick={()=>go('rev-detail')} />}
      {showFinance && <NavItem icon="⇄" label="Channel Detail"  active={activePage==='ch-detail'}   onClick={()=>go('ch-detail')} />}

      <div className="nav-section">Marketing</div>
      <NavItem icon="◎" label="Brand & Comms"   active={activePage==='brand-comms'} onClick={()=>go('brand-comms')} />
      <NavItem icon="$" label="Paid Media"       active={activePage==='marketing'}   onClick={()=>go('marketing')} />
      <NavItem icon="◈" label="Socials"          active={activePage==='socials'}     onClick={()=>go('socials')} />
      <NavItem icon="⟳" label="SEO"             active={activePage==='seo'}         onClick={()=>go('seo')} />

      {showFinance && (
        <>
          <div className="nav-section">Finance</div>
          <NavItem icon="$" label="Financial Control" active={activePage==='financial'}    onClick={()=>go('financial')} />
          <NavItem icon="⊟" label="Spend Control"     active={activePage==='spend'}        onClick={()=>go('spend')} />
          <NavItem icon="▲" label="Margin Detail"     active={activePage==='margin-detail'} onClick={()=>go('margin-detail')} />
        </>
      )}

      <div className="nav-section">People</div>
      <NavItem icon="◈" label="People & Team"   active={activePage==='team'}         onClick={()=>go('team')} />

      <div className="nav-section">Operations</div>
      <NavItem icon="⊙" label="Production Overview" active={activePage==='prod-overview'} onClick={()=>go('prod-overview')} />
      <NavItem icon="≋" label="Efficiency"           active={activePage==='efficiency'}    onClick={()=>go('efficiency')} />
      <NavItem icon="≡" label="Run Log"              active={activePage==='run-log'}       onClick={()=>go('run-log')} />
      <NavItem icon="▣" label="Inventory & Batches"  active={activePage==='inventory'}     onClick={()=>go('inventory')} />
      <NavItem icon="◆" label="Costing Engine"       active={activePage==='costing'}       onClick={()=>go('costing')} />

      <div className="nav-section">Workspace</div>
      <NavItem icon="◫" label="Task Board" active={activePage==='board'} onClick={()=>go('board')} />

      <div style={{ marginTop: 'auto' }} />
      <div style={{ borderTop: '1px solid var(--grey3)', paddingTop: 4 }}>
        <NavItem icon="⚙" label="Settings" active={activePage==='settings'} onClick={()=>go('settings')} />
      </div>

      <div className="nav-footer">FY26 · May 2026 MTD</div>
    </nav>
  )
}
