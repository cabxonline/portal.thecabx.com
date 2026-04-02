"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"

export function LoginForm({ className, ...props }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      })
      localStorage.setItem("token", res.token)
      localStorage.setItem("permissions", JSON.stringify(res.permissions))
      localStorage.setItem("user", JSON.stringify(res.user))
      document.cookie = `token=${res.token}; path=/; max-age=604800`
      toast.success("Login successful")
      router.push("/dashboard")
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={cn("w-full animate-[fadeUp_0.6s_ease_both]", className)}
      {...props}
    >
      {/* Card */}
      <div
        className="rounded-[20px] p-9 backdrop-blur-xl"
        style={{
          background: "rgba(16,16,20,0.88)",
          border: "1px solid rgba(245,197,24,0.18)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)"
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-[10px] bg-[#f5c518] flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M5 11l1.5-4.5h11L19 11M5 11v6h1v1.5a.5.5 0 001 0V17h10v1.5a.5.5 0 001 0V17h1v-6M5 11h14M8 11V8m8 3V8"
                stroke="#0a0a0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="7.5" cy="13.5" r="1" fill="#0a0a0b" />
              <circle cx="16.5" cy="13.5" r="1" fill="#0a0a0b" />
            </svg>
          </div>
          <div>
            <div className="font-black text-[22px] text-white tracking-tight font-[Syne,sans-serif]">
              Cab<span className="text-[#f5c518]">X</span>
            </div>
            <div className="text-[11px] text-white/35 tracking-wide">Your ride, your way</div>
          </div>
        </div>

        {/* Badge */}
        <span
          className="inline-flex items-center gap-1.5 text-[11px] text-[#f5c518] rounded-full px-2.5 py-1 mb-4"
          style={{ background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.2)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#f5c518] inline-block" />
          Admin Dashboard
        </span>

        <h1 className="text-[24px] font-bold text-white tracking-tight mb-1">Welcome back</h1>
        <p className="text-[13px] text-white/40 mb-6">Sign in to manage bookings & drivers</p>
        <div className="h-px mb-6" style={{ background: "rgba(245,197,24,0.12)" }} />

        <form onSubmit={handleLogin} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
              Email address
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-white/25 flex items-center pointer-events-none">
                <Mail size={15} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cabx.com"
                required
                className="w-full rounded-[10px] py-3 pl-10 pr-4 text-[14px] text-white placeholder-white/20 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)"
                }}
                onFocus={e => {
                  e.target.style.borderColor = "rgba(245,197,24,0.5)"
                  e.target.style.background = "rgba(245,197,24,0.04)"
                }}
                onBlur={e => {
                  e.target.style.borderColor = "rgba(255,255,255,0.1)"
                  e.target.style.background = "rgba(255,255,255,0.05)"
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-white/25 flex items-center pointer-events-none">
                <Lock size={15} />
              </span>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-[10px] py-3 pl-10 pr-10 text-[14px] text-white placeholder-white/20 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)"
                }}
                onFocus={e => {
                  e.target.style.borderColor = "rgba(245,197,24,0.5)"
                  e.target.style.background = "rgba(245,197,24,0.04)"
                }}
                onBlur={e => {
                  e.target.style.borderColor = "rgba(255,255,255,0.1)"
                  e.target.style.background = "rgba(255,255,255,0.05)"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-[13px] text-white/40 cursor-pointer">
              <input type="checkbox" className="accent-[#f5c518] w-3.5 h-3.5" />
              Remember me
            </label>
            <a href="#" className="text-[13px] text-[#f5c518] opacity-80 hover:opacity-100 transition-opacity">
              Forgot password?
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-[10px] bg-[#f5c518] hover:bg-[#f7cf3a] active:scale-[0.99] transition-all font-bold text-[15px] text-[#0a0a0b] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 12a9 9 0 11-4-7.5" />
                </svg>
                Logging in...
              </>
            ) : (
              <>
                <LogIn size={15} />
                Sign in to CabX
              </>
            )}
          </button>

        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          <span className="text-[12px] text-white/25">or continue with</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Google */}
        <button
          className="w-full py-3 rounded-[10px] text-[14px] text-white/70 flex items-center justify-center gap-2.5 transition-all mb-6"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
        >
          <svg width="17" height="17" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-[13px] text-white/35">
          New to CabX?{" "}
          <a href="#" className="text-[#f5c518] font-medium hover:underline">Create a free account</a>
        </p>

      </div>
    </div>
  )
}