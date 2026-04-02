"use client"

import { LoginForm } from "@/components/login-form"
import { CarTaxiFront } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-6 md:p-10 overflow-hidden bg-[#0a0a0b]">

      {/* Stars */}
      <div className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 10% 10%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 30% 6%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 14%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 75% 8%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 12%, rgba(255,255,255,0.4) 0%, transparent 100%)
          `
        }}
      />

      {/* City Silhouette */}
      <div className="absolute z-0 left-0 right-0 bottom-[200px] h-[280px] opacity-90"
        style={{
          background: `
            linear-gradient(180deg,#1a1a22,#1a1a22) 0 100%/60px 180px no-repeat,
            linear-gradient(180deg,#16161e,#16161e) 70px 100%/80px 140px no-repeat,
            linear-gradient(180deg,#1a1a22,#1a1a22) 160px 100%/50px 220px no-repeat,
            linear-gradient(180deg,#16161e,#16161e) 220px 100%/90px 160px no-repeat,
            linear-gradient(180deg,#1a1a22,#1a1a22) 320px 100%/40px 130px no-repeat,
            linear-gradient(180deg,#16161e,#16161e) 370px 100%/70px 200px no-repeat,
            linear-gradient(180deg,#1a1a22,#1a1a22) 750px 100%/100px 180px no-repeat,
            linear-gradient(180deg,#16161e,#16161e) 860px 100%/60px 220px no-repeat
          `
        }}
      />

      {/* Glow */}
      <div className="absolute z-0 top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(245,197,24,0.08) 0%, transparent 70%)" }}
      />

      {/* Road */}
      <div className="absolute bottom-0 left-0 right-0 h-[220px] bg-[#111114] z-0">
        <div className="absolute bottom-[60px] left-[-100%] w-[200%] h-[4px] opacity-70 animate-[roadMove_2s_linear_infinite]"
          style={{
            background: "repeating-linear-gradient(90deg, #f5c518 0, #f5c518 60px, transparent 60px, transparent 120px)"
          }}
        />
      </div>

      {/* Animated Cab */}
      <CabAnimation />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[440px]">
        <LoginForm />
      </div>

    </div>
  )
}

function CabAnimation() {
  return (
    <svg
      className="absolute bottom-[80px] z-0 animate-[cabDrive_12s_linear_infinite]"
      width="220" height="90" viewBox="0 0 220 90" fill="none"
    >
      <rect x="10" y="38" width="180" height="42" rx="8" fill="#f5c518" />
      <path d="M45 38 C48 18,58 14,72 14 L140 14 C154 14,164 18,168 38Z" fill="#f5c518" />
      <rect x="52" y="18" width="32" height="22" rx="4" fill="#1a1a2e" opacity="0.8" />
      <rect x="92" y="18" width="32" height="22" rx="4" fill="#1a1a2e" opacity="0.8" />
      <rect x="132" y="18" width="28" height="22" rx="4" fill="#1a1a2e" opacity="0.8" />
      <rect x="88" y="6" width="44" height="14" rx="4" fill="#0a0a0b" />
      <text x="110" y="17" textAnchor="middle" fontFamily="sans-serif" fontWeight="700" fontSize="9" fill="#f5c518">CABX</text>
      <circle cx="48" cy="80" r="14" fill="#1a1a2e" />
      <circle cx="48" cy="80" r="8" fill="#2d2d3a" />
      <circle cx="48" cy="80" r="3" fill="#f5c518" />
      <circle cx="158" cy="80" r="14" fill="#1a1a2e" />
      <circle cx="158" cy="80" r="8" fill="#2d2d3a" />
      <circle cx="158" cy="80" r="3" fill="#f5c518" />
      <ellipse cx="195" cy="52" rx="10" ry="7" fill="#fffde0" opacity="0.9" />
      <rect x="10" y="48" width="8" height="14" rx="3" fill="#ff4444" opacity="0.8" />
    </svg>
  )
}