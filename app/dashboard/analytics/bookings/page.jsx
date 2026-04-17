"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts"
import {
  TrendingUp, Users, Calendar, CheckCircle,
  ArrowUpRight, MoreHorizontal
} from "lucide-react"

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function BookingsAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const fetchData = async () => {
    try {
      setLoading(true)
      const query = new URLSearchParams()
      if (startDate) query.append("from", startDate)
      if (endDate) query.append("to", endDate)

      const res = await api(`/stats?${query.toString()}`)
      setData(res)
    } catch (err) {
      console.error("Analytics fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [startDate, endDate])

  if (loading && !data) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-slate-400">Loading Analytics...</p>
        </div>
      </div>
    )
  }

  const stats = data?.counters || {}
  const charts = data?.charts || {}

  return (
    <div className="flex-1 bg-slate-50 min-h-[calc(100vh-4rem)] text-slate-900 p-6 md:p-8" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Booking Analytics</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Real-time stats and fleet performance analysis.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
             <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl group focus-within:border-blue-500 transition-all">
                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-xl shadow-sm border border-slate-100">
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">From</span>
                   <input
                     type="date"
                     value={startDate}
                     onChange={(e) => setStartDate(e.target.value)}
                     className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
                   />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-xl shadow-sm border border-slate-100">
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">To</span>
                   <input
                     type="date"
                     value={endDate}
                     onChange={(e) => setEndDate(e.target.value)}
                     className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
                   />
                </div>
                <button
                  onClick={() => { setStartDate(""); setEndDate(""); }}
                  className="px-3 py-2 text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
                >
                  Reset
                </button>
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-bold text-blue-600 uppercase tracking-widest shadow-sm">
               <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span> Live Monitoring
             </div>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Total Bookings" value={stats.bookings} trend="+12.5%" icon={<Calendar className="w-5 h-5" />} color="blue" />
          <MetricCard title="Total Users" value={stats.users} trend="+8.2%" icon={<Users className="w-5 h-5" />} color="emerald" />
          <MetricCard title="Total Revenue" value={`₹${stats.revenue?.toLocaleString()}`} trend="+24.1%" icon={<TrendingUp className="w-5 h-5" />} color="amber" />
          <MetricCard title="Total Cars" value={stats.cars} trend="Stable" icon={<CheckCircle className="w-5 h-5" />} color="slate" />
        </div>

        {/* Intelligence Layer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
             <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Monthly Booking Trajectory</h3>
                <MoreHorizontal className="text-slate-300 w-5 h-5" />
             </div>
             <div className="h-[300px] -ml-6">
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={charts.monthlyBookings}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} 
                      />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                   </LineChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Status Mix */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest mb-8">Operational Status Mix</h3>
             <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie
                        data={charts.statusMix}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {charts.statusMix?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase'}} />
                   </PieChart>
                </ResponsiveContainer>
             </div>
          </div>

        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
             <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Recent Bookings</h3>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-slate-50/50">
                      <th className="px-8 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Customer</th>
                      <th className="px-8 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Route</th>
                      <th className="px-8 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Car Class</th>
                      <th className="px-8 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {data?.recentBookings?.map(b => (
                     <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                           <p className="font-bold text-slate-900 text-sm">{b.user?.name || "Guest"}</p>
                           <p className="text-[10px] font-bold text-slate-400">{b.user?.phone || "No Phone"}</p>
                        </td>
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                             <span className="truncate max-w-[120px]">{b.pickupAddress}</span>
                             <span className="text-slate-300">→</span>
                             <span className="truncate max-w-[120px]">{b.dropAddress}</span>
                           </div>
                        </td>
                        <td className="px-8 py-5">
                           <span className="px-2 py-1 rounded bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">{b.carCategory?.name}</span>
                        </td>
                        <td className="px-8 py-5">
                           <StatusBadge status={b.status} />
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>

      </div>
    </div>
  )
}

function MetricCard({ title, value, trend, icon, color }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    slate: "text-slate-600 bg-slate-50 border-slate-100"
  }
  
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 group hover:border-blue-500 transition-all duration-300">
       <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl ${colors[color]} border transition-transform group-hover:scale-110`}>
             {icon}
          </div>
          <div className={`flex items-center text-[10px] font-bold ${trend.startsWith('+') ? 'text-emerald-500' : 'text-slate-400'}`}>
             {trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : null}
             {trend}
          </div>
       </div>
       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
       <h2 className="text-3xl font-bold text-slate-900">{value}</h2>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    confirmed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    cancelled: "bg-rose-50 text-rose-600 border-rose-100",
  }
  return (
    <span className={`px-2.5 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest ${styles[status] || "bg-slate-100 text-slate-500 border-slate-200"}`}>
       {status}
    </span>
  )
}