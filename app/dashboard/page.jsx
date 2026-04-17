"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { SectionCards } from "@/components/section-cards"
import { Calendar, ArrowRight, Clock, MapPin, User, Car as CarIcon, CreditCard, ChevronRight } from "lucide-react"

export default function Page() {
  const [stats, setStats] = useState(null)
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const dashboard = await api("/stats")
        
        // Map backend 'counters' to 'stats' for SectionCards
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
          <svg className="animate-spin w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M21 12a9 9 0 11-4-7.5" />
          </svg>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center">Syncing Fleet <br /> Intelligence</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col w-full bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-6 py-6 md:py-8 px-4 md:px-8">

        {/* 🌟 Welcome & Quick Action Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg shadow-blue-500/20">Live Command Center</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-none">
              Control Board
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-3 max-w-md">
              Monitoring global fleet health, financial clearance, and mission-critical dispatch updates in real-time.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center gap-4 w-full sm:w-auto shadow-sm">
               <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-100 shadow-sm text-blue-600">
                  <Calendar className="w-5 h-5"/>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Current Cycle</p>
                  <p className="font-bold text-slate-900 leading-none">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
               </div>
            </div>
            <a href="/dashboard/bookings" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-slate-900/10 hover:-translate-y-0.5 active:scale-95 group">
               View All Tickets <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* 📊 KPI INTERFACE */}
        <div className="w-full">
          <SectionCards stats={stats} />
        </div>

        {/* 📋 LIVE DISPATCH TABLE */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden mt-2">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                 <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight italic">Recent Dispatch Queue</h3>
            </div>
            <a href="/dashboard/bookings" className="text-xs font-black uppercase tracking-tighter text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
              Full Registry <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
          
          <div className="overflow-x-auto selection:bg-blue-50">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-[#fcfdfe] border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Route & Schedule</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Lead Passenger</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Service Class</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Financial / Op Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Fare</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-20 text-slate-400 font-bold italic tracking-wide uppercase text-xs">No Recent Activity Detected in Queue</td>
                  </tr>
                ) : (
                  recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                           <div className="flex items-center gap-2">
                              {booking.pickupTime && (
                                <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">
                                  {booking.pickupTime}
                                </span>
                              )}
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(booking.scheduledAt || booking.createdAt).toLocaleDateString()}</span>
                           </div>
                           <div className="flex flex-col gap-1 border-l-2 border-slate-200 pl-4 ml-1">
                              <span className="font-bold text-slate-900 leading-tight flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" /> {booking.pickupAddress}
                              </span>
                              <span className="font-bold text-slate-500 text-sm leading-tight flex items-center gap-2 mt-1">
                                 <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" /> {booking.dropAddress}
                              </span>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                           <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 shadow-sm shrink-0">
                              <User className="w-4 h-4" />
                           </div>
                           <div>
                              <p className="font-black text-slate-900 text-sm leading-none mb-1.5">{booking.user?.name || "Guest User"}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter tabular-nums leading-none">{booking.mobileNumber || booking.user?.phone || "No Contact"}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1.5">
                           <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black text-slate-700 shadow-sm w-fit">
                              <CarIcon className="w-3.5 h-3.5 text-blue-600" /> {booking.carCategory?.name || "Standard Executive"}
                           </span>
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">{booking.bookingNumber}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2.5">
                           {/* Operational Status */}
                           <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border w-fit shadow-sm
                              ${booking.status === "completed" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                booking.status === "pending" || booking.status === "new_booking" ? "bg-amber-50 text-amber-600 border-amber-200" :
                                booking.status === "cancelled" ? "bg-rose-50 text-rose-600 border-rose-200" :
                                "bg-blue-50 text-blue-600 border-blue-200"}
                           `}>
                              {booking.status === "completed" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                              {(booking.status === "pending" || booking.status === "new_booking") && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                              {booking.status === "cancelled" && <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                              {booking.status?.replace("_", " ")}
                           </span>
                           {/* Payment Status */}
                           <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${booking.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                              <CreditCard className="w-3 h-3" />
                              {booking.paymentStatus === 'paid' ? 'Financials Cleared' : 'Collection Pending'}
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <p className="font-black text-slate-900 text-lg tabular-nums tracking-tighter">₹{booking.fare || "0.00"}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Est. System Payout</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <a href={`/dashboard/bookings/${booking.id}/show`} className="inline-flex items-center justify-center p-3 rounded-xl bg-slate-900 hover:bg-black text-white transition-all shadow-lg hover:shadow-slate-200 active:scale-90 group/btn">
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
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