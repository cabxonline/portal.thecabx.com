"use client"

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="h-screen w-full flex bg-slate-50 overflow-hidden selection:bg-blue-100 selection:text-blue-900">

      {/* LEFT PANE - DIGITAL ASSET (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden bg-blue-600 items-center justify-center p-8 xl:p-12">

        {/* Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400 opacity-30 blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-800 opacity-40 blur-[80px]" />

        {/* Brand Core */}
        <div className="relative z-10 w-full max-w-md">
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-white font-bold animate-pulse"></span>
            <span className="text-white text-[10px] font-bold uppercase tracking-widest">Global Fleet Command</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tighter mb-4">
            Intelligent <br /> Mobility Control
          </h1>

          <p className="text-sm xl:text-base text-blue-100 leading-relaxed max-w-sm mb-10">
            Manage drivers, track real-time fleet analytics, and aggressively optimize routes from your central administrative nervous system.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="border-l-2 border-white/30 pl-4">
              <div className="text-2xl font-black text-white">100%</div>
              <div className="text-[10px] font-bold tracking-wider text-blue-200 uppercase mt-1">System Uptime</div>
            </div>
            <div className="border-l-2 border-white/30 pl-4">
              <div className="text-2xl font-black text-white">2.4<span className="text-sm text-blue-200">s</span></div>
              <div className="text-[10px] font-bold tracking-wider text-blue-200 uppercase mt-1">Dispatch Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE - LOGIN FORM */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 relative">
        <div className="w-full max-w-[380px] relative z-10">
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="absolute bottom-4 text-center text-[10px] text-slate-400 font-medium w-full pointer-events-none">
          © {new Date().getFullYear()} CabX Platforms Inc. Secure Portal.
        </p>

      </div>

    </div>
  )
}