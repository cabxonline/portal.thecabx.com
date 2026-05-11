"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { SectionCards } from "@/components/section-cards"
import { Calendar, ArrowRight, Clock, User, Car as CarIcon, CreditCard, ChevronRight, Activity, ArrowUpRight } from "lucide-react"

export default function Page() {
  const [stats, setStats] = useState(null)
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const dashboard = await api("/stats")
        setStats({
          users: dashboard.counters?.users || 0,
          bookings: dashboard.counters?.bookings || 0,
          cars: dashboard.counters?.cars || 0,
          revenue: dashboard.counters?.revenue || 0
        })
        setRecentBookings(dashboard.recentBookings || [])
      } catch (err) {
        console.error("Dashboard load error:", err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">Initializing <br /> Command Systems</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col w-full bg-[#F8FAFF] min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-8 py-8 px-4 md:px-10">

        {/* 🌟 PREMIUM HEADER */}
        <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-900/20">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center gap-1.5 bg-blue-500 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg shadow-blue-500/30">
                  <Activity className="w-3 h-3" /> System Operational
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                Global Fleet <br className="hidden md:block" /> Command Board
              </h1>
              <p className="text-slate-400 font-medium text-base leading-relaxed">
                Seamlessly orchestrating dispatches, financial clearances, and driver performance across all active service nodes in real-time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-4">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl flex items-center gap-4 shadow-2xl">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Fleet Cycle</p>
                  <p className="font-bold text-white text-lg">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              <a href="/dashboard/bookings" className="group flex items-center justify-center gap-3 bg-white text-slate-900 px-8 py-5 rounded-3xl font-black text-sm transition-all hover:bg-blue-50 hover:shadow-xl hover:shadow-white/10 active:scale-95">
                Dispatch Registry <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        {/* 📊 ANALYTICS HUD */}
        <SectionCards stats={stats} />

        {/* 📋 DISPATCH QUEUE */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Live Queue</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time mission status</p>
              </div>
            </div>
            <a href="/dashboard/bookings" className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 flex items-center gap-2 group px-4 py-2 bg-blue-50 rounded-xl transition-colors">
              Full Spectrum View <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-[#fcfdfe] border-b border-slate-50">
                <tr>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Route Architecture</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Commander Info</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Vessel Class</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Operational Integrity</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Yield</th>
                  <th className="px-10 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-24">
                      <div className="flex flex-col items-center opacity-20">
                        <Activity className="w-16 h-16 text-slate-300 mb-4" />
                        <p className="font-black italic tracking-[0.2em] uppercase text-xs">Awaiting New Signals</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-blue-50/30 transition-all duration-300 group cursor-default">
                      <td className="px-10 py-8">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black bg-blue-600 text-white px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-md shadow-blue-500/20">
                              {booking.pickupTime || "TBD"}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(booking.scheduledAt || booking.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}</span>
                          </div>
                          <div className="flex flex-col gap-1.5 border-l-2 border-slate-200 pl-4 ml-1 relative">
                            <div className="absolute top-0 -left-[5px] w-2 h-2 rounded-full bg-blue-500 ring-4 ring-white" />
                            <div className="absolute bottom-0 -left-[5px] w-2 h-2 rounded-full bg-rose-500 ring-4 ring-white" />
                            <span className="font-bold text-slate-900 text-sm leading-none">{booking.pickupAddress || "Origin Point"}</span>
                            <span className="font-bold text-slate-400 text-xs leading-none mt-1">{booking.dropAddress || "Target Point"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-xl group-hover:shadow-slate-200 transition-all">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-base leading-none mb-2">{booking.user?.name || "Anonymous"}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest tabular-nums leading-none">{booking.mobileNumber || "Encrypted"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-col gap-2">
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-700 shadow-sm w-fit group-hover:bg-white transition-all">
                            <CarIcon className="w-4 h-4 text-blue-600" /> {booking.carCategory?.name || "Executive"}
                          </span>
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] ml-1">{booking.bookingNumber}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-col gap-3">
                          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border w-fit
                              ${booking.status === "completed" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                              booking.status === "pending" || booking.status === "new_booking" ? "bg-amber-50 text-amber-600 border-amber-200" :
                                booking.status === "cancelled" ? "bg-rose-50 text-rose-600 border-rose-200" :
                                  "bg-blue-50 text-blue-600 border-blue-200"}
                           `}>
                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${booking.status === "completed" ? "bg-emerald-500" : booking.status === "cancelled" ? "bg-rose-500" : "bg-blue-500"}`} />
                            {booking.status?.replace("_", " ")}
                          </span>
                          <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${booking.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                            <CreditCard className="w-3.5 h-3.5" />
                            {booking.paymentStatus === 'paid' ? 'Settled' : 'Unpaid'}
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <p className="font-black text-slate-900 text-xl tabular-nums tracking-tighter">₹{(booking.fare || 0).toLocaleString()}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">System Revenue</p>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <a href={`/dashboard/bookings/${booking.id}/show`} className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm hover:shadow-xl hover:shadow-slate-200 active:scale-90 group/btn">
                          <ChevronRight className="w-6 h-6 transition-transform group-hover/btn:translate-x-0.5" />
                        </a>
                      </td>
                    </tr>
                  )
                  ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}