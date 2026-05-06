'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let particles: Particle[] = []
    let t = 0

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    interface Particle {
      x: number; y: number
      vx: number; vy: number
      size: number; life: number; decay: number
      r: number; g: number; b: number
    }

    function spawnParticle(cx: number, cy: number) {
      const angle = (Math.random() * 60 - 30 - 90) * Math.PI / 180
      const speed = 0.5 + Math.random() * 2.5
      const hot = Math.random()
      particles.push({
        x: cx + (Math.random() - 0.5) * 30,
        y: cy + Math.random() * 20,
        vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 0.4 : 1),
        vy: Math.sin(angle) * speed - 0.5,
        size: 3 + Math.random() * 8,
        life: 1,
        decay: 0.008 + Math.random() * 0.014,
        r: hot > 0.6 ? 255 : 255,
        g: hot > 0.6 ? Math.floor(hot * 200) : Math.floor(Math.random() * 80),
        b: 0,
      })
    }

    function draw() {
      if (!canvas || !ctx) return
      t++
      const cx = canvas.width / 2
      const cy = canvas.height * 0.42

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Spawn 3-6 particles per frame
      const count = 3 + Math.floor(Math.random() * 4)
      for (let i = 0; i < count; i++) spawnParticle(cx, cy)

      // Draw & age particles
      particles = particles.filter(p => p.life > 0)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.vy -= 0.04
        p.vx *= 0.99
        p.life -= p.decay
        p.size *= 0.995

        const alpha = Math.max(0, p.life)
        ctx.globalAlpha = alpha * 0.85
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
        grad.addColorStop(0, `rgb(${p.r},${p.g},${p.b})`)
        grad.addColorStop(1, `rgba(${p.r},${p.b},0,0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })

      // Central glow
      ctx.globalAlpha = 0.12 + Math.sin(t * 0.05) * 0.04
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200)
      glow.addColorStop(0, '#ff3300')
      glow.addColorStop(0.4, '#C0392B')
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, 200, 0, Math.PI * 2)
      ctx.fill()

      ctx.globalAlpha = 1
      animId = requestAnimationFrame(draw)
    }

    // Short delay before starting
    const timeout = setTimeout(() => { draw() }, 100)

    return () => {
      cancelAnimationFrame(animId)
      clearTimeout(timeout)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: "'VisbyRound', sans-serif",
    fontWeight: 700,
    fontSize: 10,
    color: '#555',
    marginBottom: 7,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#0e0e0e',
    border: '1px solid #222',
    borderRadius: 8,
    padding: '13px 15px',
    color: '#fff',
    fontSize: 14,
    fontFamily: "'VisbyRound', sans-serif",
    fontWeight: 700,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#060606',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Flame canvas — behind everything */}
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
      }} />

      {/* Logo — sits above flame */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -100%)',
        animation: 'logoReveal 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.3s both',
        zIndex: 2,
      }}>
        <Image
          src="/chilli.png"
          alt="UmamiPapi"
          width={120} height={112}
          style={{ filter: 'drop-shadow(0 0 30px rgba(255,80,0,0.6))' }}
          priority
        />
      </div>

      {/* Login card — slides up from bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '100%', maxWidth: 400,
        background: 'rgba(8,8,8,0.97)',
        border: '1px solid rgba(192,57,43,0.2)',
        borderRadius: '20px 20px 0 0',
        padding: '36px 32px 52px',
        zIndex: 3,
        boxShadow: '0 -20px 80px rgba(192,57,43,0.1)',
        backdropFilter: 'blur(10px)',
        animation: 'cardReveal 0.7s cubic-bezier(0.22,1,0.36,1) 0.8s both',
      }}>
        {/* Wordmark inside card */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontFamily: "'BarlowCondensed', sans-serif",
            fontWeight: 700,
            fontStyle: 'italic',
            fontSize: 32,
            color: '#fff',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}>
            Sign in
          </div>
          <div style={{
            fontFamily: "'VisbyRound', sans-serif",
            fontWeight: 700,
            fontSize: 11,
            color: '#C0392B',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginTop: 6,
          }}>
            UmamiPapi · Internal Platform
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="you@umamipapi.com.au"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = '#C0392B' }}
              onBlur={e => { e.target.style.borderColor = '#222' }}
            />
          </div>
          <div style={{ marginBottom: 22 }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = '#C0392B' }}
              onBlur={e => { e.target.style.borderColor = '#222' }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(192,57,43,0.1)',
              border: '1px solid rgba(192,57,43,0.25)',
              borderRadius: 6,
              padding: '9px 12px',
              marginBottom: 14,
              fontSize: 12,
              fontFamily: "'VisbyRound', sans-serif",
              fontWeight: 700,
              color: '#e8a090',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#1a1a1a' : '#C0392B',
              color: loading ? '#444' : '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '14px 0',
              fontFamily: "'BarlowCondensed', sans-serif",
              fontWeight: 700,
              fontStyle: 'italic',
              fontSize: 18,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes logoReveal {
          from { opacity: 0; transform: translate(-50%, -90%) scale(0.7); }
          to   { opacity: 1; transform: translate(-50%, -100%) scale(1); }
        }
        @keyframes cardReveal {
          from { opacity: 0; transform: translateX(-50%) translateY(60px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
