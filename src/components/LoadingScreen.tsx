'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

export default function LoadingScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let particles: Particle[] = []
    let t = 0

    interface Particle {
      x: number; y: number
      vx: number; vy: number
      size: number; life: number; decay: number
      r: number; g: number; b: number
    }

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function spawnParticle(cx: number, cy: number) {
      const angle = (Math.random() * 50 - 25 - 90) * Math.PI / 180
      const speed = 0.4 + Math.random() * 2
      const hot = Math.random()
      particles.push({
        x: cx + (Math.random() - 0.5) * 24,
        y: cy + Math.random() * 10,
        vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 0.3 : 1),
        vy: Math.sin(angle) * speed - 0.3,
        size: 4 + Math.random() * 10,
        life: 1,
        decay: 0.01 + Math.random() * 0.016,
        r: 255,
        g: hot > 0.5 ? Math.floor(hot * 180) : Math.floor(Math.random() * 60),
        b: 0,
      })
    }

    function draw() {
      if (!canvas || !ctx) return
      t++

      const cx = canvas.width / 2
      // flame origin — just below where the chilli sits
      const cy = canvas.height / 2 + 30

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < 5; i++) spawnParticle(cx, cy)

      particles = particles.filter(p => p.life > 0)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.vy -= 0.035
        p.vx *= 0.99
        p.life -= p.decay
        p.size *= 0.997

        const alpha = Math.max(0, p.life)
        ctx.globalAlpha = alpha * 0.8
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
        grad.addColorStop(0, `rgb(${p.r},${p.g},${p.b})`)
        grad.addColorStop(1, `rgba(${p.r},0,0,0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })

      // Pulsing glow under chilli
      const glowAlpha = 0.08 + Math.sin(t * 0.06) * 0.04
      ctx.globalAlpha = glowAlpha
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 140)
      glow.addColorStop(0, '#ff4400')
      glow.addColorStop(0.5, '#C0392B')
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, 140, 0, Math.PI * 2)
      ctx.fill()

      ctx.globalAlpha = 1
      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#060606',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
    }}>
      <style>{`
        @keyframes chilliFloat {
          0%, 100% { transform: translateY(0) rotate(-2deg); filter: drop-shadow(0 0 20px rgba(255,80,0,0.5)); }
          50%       { transform: translateY(-8px) rotate(2deg); filter: drop-shadow(0 0 36px rgba(255,80,0,0.8)); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fireFlicker {
          0%,100% { opacity: 0.7; transform: scaleX(1); }
          50%     { opacity: 1;   transform: scaleX(1.08); }
        }
      `}</style>

      {/* Flame canvas */}
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
      }} />

      {/* Chilli */}
      <div style={{ animation: 'chilliFloat 2s ease-in-out infinite', zIndex: 1, marginBottom: 4 }}>
        <Image src="/chilli.png" alt="" width={100} height={94} priority />
      </div>

      {/* Wordmark */}
      <div style={{
        fontFamily: "'BarlowCondensed', sans-serif",
        fontWeight: 700,
        fontStyle: 'italic',
        fontSize: 28,
        color: '#fff',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        zIndex: 1,
        animation: 'fadeSlideUp 0.5s ease 0.2s both',
        marginBottom: 4,
      }}>
        UmamiPapi
      </div>

      {/* Subtitle */}
      <div style={{
        fontFamily: "'VisbyRound', sans-serif",
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: '0.3em',
        color: '#C0392B',
        textTransform: 'uppercase',
        zIndex: 1,
        animation: 'fadeSlideUp 0.5s ease 0.35s both',
        marginBottom: 36,
      }}>
        Loading
      </div>

      {/* Fire bar — flickering flame-coloured progress indicator */}
      <div style={{
        width: 120, height: 3, borderRadius: 3,
        background: '#1a1a1a', overflow: 'hidden',
        zIndex: 1,
        animation: 'fadeSlideUp 0.5s ease 0.5s both',
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #7B0F05, #C0392B, #ff4400, #ff8800)',
          backgroundSize: '200% 100%',
          borderRadius: 3,
          animation: 'fireFlicker 0.7s ease-in-out infinite, shimmer 1.4s linear infinite',
        }} />
      </div>

      <style>{`
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to   { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
