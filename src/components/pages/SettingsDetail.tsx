'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'

const ROLES = ['admin', 'finance', 'ops', 'commercial', 'production', 'viewer'] as const
type Role = typeof ROLES[number]

interface UserRole {
  id: string
  user_id: string
  email: string
  name: string
  role: Role
  created_at: string
}

const ROLE_COLORS: Record<Role, string> = {
  admin:      '#C0392B',
  finance:    '#2980B9',
  ops:        '#27AE60',
  commercial: '#E67E22',
  production: '#8E44AD',
  viewer:     '#888',
}

const ROLE_DESC: Record<Role, string> = {
  admin:      'Full access — all pages, user management',
  finance:    'Financial Control, P&L, spend',
  ops:        'Operations, production, inventory',
  commercial: 'Sales, marketing, costing',
  production: 'Inventory & batches, production runs',
  viewer:     'Read-only access to all pages',
}

function RoleBadge({ role }: { role: Role }) {
  return (
    <span style={{
      background: `${ROLE_COLORS[role]}22`,
      color: ROLE_COLORS[role],
      border: `1px solid ${ROLE_COLORS[role]}44`,
      borderRadius: 4,
      padding: '2px 8px',
      fontSize: 10,
      fontFamily: "'VisbyRound', sans-serif",
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    }}>
      {role}
    </span>
  )
}

function UserRow({ user, currentEmail, onRoleChange }: {
  user: UserRole
  currentEmail: string
  onRoleChange: (userId: string, newRole: Role) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role>(user.role)
  const [saving, setSaving] = useState(false)
  const isSelf = user.email === currentEmail

  async function save() {
    setSaving(true)
    await onRoleChange(user.user_id, selectedRole)
    setSaving(false)
    setEditing(false)
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '14px 16px',
      borderBottom: '1px solid var(--grey3)',
      flexWrap: 'wrap',
    }}>
      {/* Avatar */}
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: `${ROLE_COLORS[user.role]}22`,
        border: `1px solid ${ROLE_COLORS[user.role]}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        color: ROLE_COLORS[user.role],
        fontFamily: "'VisbyRound', sans-serif",
        fontWeight: 700,
        flexShrink: 0,
      }}>
        {user.name.charAt(0).toUpperCase()}
      </div>

      {/* Name + email */}
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ fontSize: 14, color: 'var(--creme)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
          {user.name}
          {isSelf && (
            <span style={{ fontSize: 9, color: 'var(--mid)', fontFamily: "'VisbyRound', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase' }}>You</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--mid)', marginTop: 2 }}>{user.email}</div>
      </div>

      {/* Role */}
      <div style={{ minWidth: 120 }}>
        {editing ? (
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value as Role)}
            autoFocus
            style={{
              background: 'var(--input-bg)',
              border: '1px solid #C0392B',
              borderRadius: 5,
              padding: '5px 10px',
              color: 'var(--creme)',
              fontSize: 12,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {ROLES.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        ) : (
          <RoleBadge role={user.role} />
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
        {editing ? (
          <>
            <button
              onClick={save}
              disabled={saving || selectedRole === user.role}
              style={{
                background: saving || selectedRole === user.role ? 'var(--grey3)' : '#C0392B',
                color: saving || selectedRole === user.role ? 'var(--mid)' : '#fff',
                border: 'none',
                borderRadius: 5,
                padding: '5px 14px',
                fontSize: 11,
                fontFamily: "'VisbyRound', sans-serif",
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => { setEditing(false); setSelectedRole(user.role) }}
              style={{
                background: 'transparent',
                color: 'var(--mid)',
                border: '1px solid var(--grey3)',
                borderRadius: 5,
                padding: '5px 12px',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            disabled={isSelf && user.role === 'admin'}
            title={isSelf && user.role === 'admin' ? "Can't demote yourself" : 'Change role'}
            style={{
              background: 'transparent',
              color: 'var(--mid)',
              border: '1px solid var(--grey3)',
              borderRadius: 5,
              padding: '5px 12px',
              fontSize: 11,
              fontFamily: "'VisbyRound', sans-serif",
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: isSelf && user.role === 'admin' ? 'not-allowed' : 'pointer',
            }}
          >
            Edit role
          </button>
        )}
      </div>
    </div>
  )
}

export default function SettingsDetail({ userEmail }: { userEmail: string }) {
  const [users, setUsers] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('user_roles')
      .select('*')
      .order('created_at')
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setUsers(data ?? [])
        setLoading(false)
      })
  }, [])

  async function handleRoleChange(userId: string, newRole: Role) {
    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId)
    if (error) {
      alert('Failed to update role: ' + error.message)
      return
    }
    setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, role: newRole } : u))
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: "'VisbyRound', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--creme)',
    marginBottom: 18,
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--grey)',
    border: '1px solid var(--grey3)',
    borderRadius: 10,
    overflow: 'hidden',
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>

      {/* Users section */}
      <div style={{ marginBottom: 48 }}>
        <div style={labelStyle}>Team Members</div>
        <div style={cardStyle}>
          {loading && (
            <div style={{ padding: 24, color: 'var(--mid)', fontSize: 13 }}>Loading users…</div>
          )}
          {error && (
            <div style={{ padding: 16, color: '#e8a090', fontSize: 12 }}>Error: {error}</div>
          )}
          {!loading && users.length === 0 && !error && (
            <div style={{ padding: 24, color: 'var(--mid)', fontSize: 13 }}>
              No users in user_roles table yet. Add team members via Supabase Auth → invite user, then insert a row into user_roles.
            </div>
          )}
          {users.map(u => (
            <UserRow
              key={u.user_id}
              user={u}
              currentEmail={userEmail}
              onRoleChange={handleRoleChange}
            />
          ))}
        </div>
      </div>

      {/* Role reference */}
      <div style={{ marginBottom: 48 }}>
        <div style={labelStyle}>Role Permissions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {ROLES.map(role => (
            <div key={role} style={{
              background: 'var(--grey)',
              border: '1px solid var(--grey3)',
              borderRadius: 8,
              padding: '12px 14px',
            }}>
              <RoleBadge role={role} />
              <div style={{ fontSize: 12, color: 'var(--mid)', marginTop: 8, fontFamily: "'VisbyRound', sans-serif", fontWeight: 300 }}>
                {ROLE_DESC[role]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sync info */}
      <div>
        <div style={labelStyle}>Data & Sync</div>
        <div style={{ ...cardStyle, padding: '16px 18px', overflow: 'visible' }}>
          <div style={{ fontSize: 12, color: 'var(--mid)', fontFamily: "'VisbyRound', sans-serif", lineHeight: 1.8 }}>
            <div style={{ marginBottom: 10 }}>
              <span style={{ color: 'var(--creme)', fontWeight: 500 }}>MasterPapi sync</span>
              {' — '}run{' '}
              <code style={{ background: 'var(--bar-bg)', color: 'var(--light)', padding: '1px 6px', borderRadius: 3, fontSize: 11 }}>python3 scripts/sync_masterpapi.py</code>
              {' '}to pull revenue, production, batches & daily metrics.
            </div>
            <div style={{ marginBottom: 10 }}>
              <span style={{ color: 'var(--creme)', fontWeight: 500 }}>MarginPapi sync</span>
              {' — '}run{' '}
              <code style={{ background: 'var(--bar-bg)', color: 'var(--light)', padding: '1px 6px', borderRadius: 3, fontSize: 11 }}>python3 scripts/sync_marginpapi.py</code>
              {' '}to pull COGS & costing from all 5 MarginPapi files.
            </div>
            <div>
              <span style={{ color: 'var(--creme)', fontWeight: 500 }}>Deploy</span>
              {' — '}run{' '}
              <code style={{ background: 'var(--bar-bg)', color: 'var(--light)', padding: '1px 6px', borderRadius: 3, fontSize: 11 }}>vercel --prod</code>
              {' '}to push updates to hub.umamipapi.com.au.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
