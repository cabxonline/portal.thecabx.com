"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { GoogleLogin } from "@react-oauth/google"

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

  const handleGoogleSuccess = async (response) => {
    try {
      setLoading(true)
      const res = await api("/auth/google", {
        method: "POST",
        body: JSON.stringify({ credential: response.credential })
      })
      localStorage.setItem("token", res.token)
      localStorage.setItem("permissions", JSON.stringify(res.permissions))
      localStorage.setItem("user", JSON.stringify(res.user))
      document.cookie = `token=${res.token}; path=/; max-age=604800`
      toast.success("Google login successful")
      router.push("/dashboard")
    } catch (err) {
      toast.error(err.message || "Google authentication failed")
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
      <div className="rounded-[1.5rem] p-6 lg:p-8 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-slate-100">
        
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-inner">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M5 11l1.5-4.5h11L19 11M5 11v6h1v1.5a.5.5 0 001 0V17h10v1.5a.5.5 0 001 0V17h1v-6M5 11h14M8 11V8m8 3V8"
                stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="7.5" cy="13.5" r="1.5" fill="#fff" />
              <circle cx="16.5" cy="13.5" r="1.5" fill="#fff" />
            </svg>
          </div>
          <div>
            <div className="font-black text-2xl text-slate-900 tracking-tight font-[Syne,sans-serif]">
              Cab<span className="text-blue-600">X</span>
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Your ride, your way</div>
          </div>
        </div>

        <h1 className="text-xl font-black text-slate-900 tracking-tight mb-1">Welcome back</h1>
        <p className="text-xs text-slate-500 mb-5">Sign in to manage bookings & drivers globally</p>

        <form onSubmit={handleLogin} className="space-y-3.5">

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
              Work Email
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400 flex items-center pointer-events-none">
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cabx.com"
                required
                className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-300 bg-slate-50 border border-slate-200 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
              Secure Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400 flex items-center pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-300 bg-slate-50 border border-slate-200 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 text-slate-400 hover:text-blue-600 transition-colors bg-white rounded-md p-0.5"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between pt-1 mb-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-500 cursor-pointer">
              <input type="checkbox" className="accent-blue-600 w-3.5 h-3.5 rounded-sm border-slate-300" />
              Remember me
            </label>
            <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Reset password?
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30"
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 12a9 9 0 11-4-7.5" />
                </svg>
                Authenticating...
              </>
            ) : (
              <>
                <LogIn size={16} />
                Access Dashboard
              </>
            )}
          </button>

        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5 opacity-60">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Secure SSO</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Google */}
        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error("Google verify failed")}
            useOneTap
            theme="outline"
            size="large"
            shape="pill"
            width="320"
          />
        </div>

      </div>
    </div>
  )
}