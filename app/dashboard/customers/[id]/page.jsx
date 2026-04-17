"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  ChevronRight, 
  History, 
  ArrowLeft,
  Clock,
  ShieldCheck,
  Star,
  Activity,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function CustomerShow() {
  const { id } = useParams()
  const router = useRouter()

  const [customer, setCustomer] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const userData = await api(`/users/${id}`)
        // Robust fetch: handle cases where API might expect a different query param
        const bookingsData = await api(`/bookings?userId=${id}`)

        setCustomer(userData)
        setBookings(Array.isArray(bookingsData) ? bookingsData : (bookingsData?.data || []))
      } catch (err) {
        console.error("Fetch profile error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M21 12a9 9 0 11-4-7.5" />
          </svg>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center">Interrogating <br /> Profile Database</p>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] p-8">
        <div className="text-center max-w-sm">
           <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4 border border-slate-200 shadow-sm">
              <User className="w-8 h-8" />
           </div>
           <h3 className="text-xl font-black text-slate-900 mb-2">Profile Not Located</h3>
           <p className="text-slate-500 text-sm font-medium mb-6">The requested customer record does not exist or has been decommissioned.</p>
           <button onClick={() => router.back()} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg">Return to Network</button>
        </div>
      </div>
    )
  }

  // Analytics helper
  const totalSpend = bookings.reduce((sum, b) => sum + (Number(b.fare) || 0), 0)
  const completedRides = bookings.filter(b => b.status === 'completed').length

  return (
    <div className="flex flex-1 flex-col w-full bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-6 py-6 md:py-8 px-4 md:px-8">

        {/* 🌟 PROFILE HEADER COMMAND CENTER */}
        <div className="flex flex-col gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                 <div className="w-24 h-24 rounded-[2rem] bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-indigo-500 shadow-xl shadow-indigo-500/10 relative">
                    <User className="w-10 h-10" />
                    <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-xl shadow-md border border-slate-100">
                       <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                          <ShieldCheck className="w-5 h-5" />
                       </div>
                    </div>
                 </div>
                 <div>
                    <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-none mb-3 italic">
                       {customer.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2">
                       <span className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg">Network Node: #{customer.id}</span>
                       <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-indigo-100 italic">Account Active</span>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-3">
                 <a href={`mailto:${customer.email}`} className="flex-1 sm:flex-none py-3 px-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm transition-all hover:bg-slate-100 active:scale-95 flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" /> Message
                 </a>
                 <button className="flex-1 sm:flex-none py-3 px-6 rounded-2xl bg-indigo-600 border border-indigo-500 text-white font-bold text-sm transition-all hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4 fill-white" /> Issue Alert
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-50 mt-2">
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Communication Link</p>
                 <p className="font-bold text-slate-700 text-sm truncate">{customer.email}</p>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Verified Contact</p>
                 <p className="font-bold text-slate-700 text-sm">{customer.phone || "No direct link active"}</p>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Security Clearance</p>
                 <p className="font-bold text-indigo-600 text-sm italic">{customer.role?.name || "Standard Network Access"}</p>
              </div>
           </div>
        </div>

        {/* 📊 ANALYTICS HUD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                 <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                    <History className="w-5 h-5" />
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifetime Trips</span>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{bookings.length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Network Deployments</p>
           </div>
           <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 italic">
              <div className="flex items-center justify-between mb-4">
                 <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <Star className="w-5 h-5" />
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Success Rate</span>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{bookings.length > 0 ? ((completedRides / bookings.length) * 100).toFixed(0) : 0}%</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Confirmed Flight Success</p>
           </div>
           <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                 <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <CreditCard className="w-5 h-5" />
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Valuation</span>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tight italic">₹{totalSpend.toLocaleString()}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lifetime Fare Generation</p>
           </div>
        </div>

        {/* 📋 ACTIVITY LOGS */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight italic">Intelligence Activity Logs</h3>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 tabular-nums">Registry Count: {bookings.length}</div>
          </div>
          
          <div className="overflow-x-auto selection:bg-indigo-50 font-medium">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-[#fcfdfe] border-b border-slate-100 italic">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Route Pattern</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Operational Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Fare Data</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Execution Date</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-20 text-slate-300 font-bold uppercase text-xs tracking-widest italic">No Network Activity Recorded For This Identity</td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1 border-l-2 border-slate-200 pl-4 ml-1">
                           <span className="font-bold text-slate-900 leading-tight flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" /> {booking.pickupAddress}
                           </span>
                           <span className="font-bold text-slate-400 text-sm leading-tight flex items-center gap-2 mt-1 italic">
                              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" /> {booking.dropAddress}
                           </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                          booking.status === "completed" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                          booking.status === "pending" || booking.status === "new_booking" ? "bg-amber-50 text-amber-600 border-amber-200" :
                          booking.status === "cancelled" ? "bg-rose-50 text-rose-600 border-rose-200" :
                          "bg-blue-50 text-blue-600 border-blue-200"
                        )}>
                          {booking.status === "completed" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                          {(booking.status === "pending" || booking.status === "new_booking") && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                          {booking.status === "cancelled" && <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                          {booking.status?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right font-black italic">
                        <p className="text-slate-900 tracking-tight tabular-nums">₹{booking.fare || "0.00"}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex flex-col items-end gap-1 font-bold">
                            <span className="text-slate-900 text-sm leading-none flex items-center gap-1.5 group-hover:text-indigo-600 transition-colors">
                               <Calendar className="w-3 h-3 text-slate-300" /> {new Date(booking.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                               <Clock className="w-3 h-3" /> {new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <a href={`/dashboard/bookings/${booking.id}/show`} className="inline-flex items-center justify-center p-3 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-600 transition-all shadow-sm active:scale-95 group/btn">
                            <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
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