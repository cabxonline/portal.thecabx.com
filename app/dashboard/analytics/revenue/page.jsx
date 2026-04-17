"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, Legend
} from "recharts"
import { 
  Wallet, TrendingUp, CreditCard, Banknote, 
  ArrowUpRight, ArrowDownRight, Filter, Download,
  Activity, PieChart as PieIcon
} from "lucide-react"

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function RevenueAnalytics() {
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
      console.error("Revenue fetch error:", err)
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
          <div className="w-12 h-1 border-4 border-blue-600 rounded-full animate-progress-flow"></div>
          <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">Syncing_Fiscal_Data</p>
        </div>
      </div>
    )
  }

  const counters = data?.counters || {}
  const charts = data?.charts || {}

  return (
    <div className="flex-1 bg-slate-50 min-h-[calc(100vh-4rem)] text-slate-900 p-6 md:p-8" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tight">Revenue Reports</h1>
             <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-widest text-[10px]">Fiscal Intelligence Grid</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
             {/* Date Range Filter */}
             <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl group focus-within:border-blue-500 transition-all">
                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-xl shadow-sm border border-slate-100">
                   <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Start</span>
                   <input
                     type="date"
                     value={startDate}
                     onChange={(e) => setStartDate(e.target.value)}
                     className="bg-transparent text-[10px] font-black text-slate-700 outline-none cursor-pointer"
                   />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-xl shadow-sm border border-slate-100">
                   <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">End</span>
                   <input
                     type="date"
                     value={endDate}
                     onChange={(e) => setEndDate(e.target.value)}
                     className="bg-transparent text-[10px] font-black text-slate-700 outline-none cursor-pointer"
                   />
                </div>
                <button
                  onClick={() => { setStartDate(""); setEndDate(""); }}
                  className="px-3 py-2 text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
                >
                  Reset
                </button>
             </div>

             <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] uppercase font-black tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                   <Download className="w-4 h-4" />
                   Export
                </button>
             </div>
          </div>
        </div>

        {/* Financial KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <RevenueKPI title="Net Capital Flow" value={`₹${counters.revenue?.toLocaleString()}`} delta="+18.5%" icon={<Wallet className="w-6 h-6" />} color="blue" />
           <RevenueKPI title="Active Transactions" value={counters.bookings} delta="+4.2%" icon={<Activity className="w-6 h-6" />} color="purple" />
           <RevenueKPI title="Conversion Yield" value="94.2%" delta="+1.1%" icon={<TrendingUp className="w-6 h-6" />} color="emerald" />
        </div>

        {/* Fiscal Visualization Tier */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           {/* Area Chart: Revenue Growth */}
           <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                 <div className="w-12 h-12 rounded-full border border-blue-100 flex items-center justify-center bg-blue-50/50">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                 </div>
              </div>
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-10">Revenue_Trajectory_Delta</h3>
              <div className="h-[350px] -ml-6">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts.monthlyRevenue}>
                       <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                       <Tooltip content={<CustomTooltip />} />
                       <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={5} fillOpacity={1} fill="url(#colorRev)" dot={{ r: 6, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff' }} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Bar Chart: Provider Mix */}
           <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-200">
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-10">Provider_Dominance_Matrix</h3>
              <div className="h-[350px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.providerMix}>
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                       <Tooltip cursor={{fill: '#f1f5f9'}} content={<CustomTooltip />} />
                       <Bar dataKey="value" radius={[15, 15, 0, 0]} barSize={40}>
                          {charts.providerMix?.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
              <div className="mt-6 flex justify-center gap-6">
                 {charts.providerMix?.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                       <span className="text-[10px] font-black uppercase text-slate-400">{entry.name}</span>
                    </div>
                 ))}
              </div>
           </div>

        </div>

        {/* Provider Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <ProviderCard name="Razorpay" logo={<CreditCard className="w-5 h-5" />} color="blue" amount={`₹${(counters.revenue * 0.65).toLocaleString()}`} share="65%" />
           <ProviderCard name="Direct Cash" logo={<Banknote className="w-5 h-5" />} color="emerald" amount={`₹${(counters.revenue * 0.25).toLocaleString()}`} share="25%" />
           <ProviderCard name="Stripe" logo={<Activity className="w-5 h-5" />} color="purple" amount={`₹${(counters.revenue * 0.08).toLocaleString()}`} share="8%" />
           <ProviderCard name="Internal" logo={<PieIcon className="w-5 h-5" />} color="amber" amount={`₹${(counters.revenue * 0.02).toLocaleString()}`} share="2%" />
        </div>

      </div>
    </div>
  )
}

function RevenueKPI({ title, value, delta, icon, color }) {
  const styles = {
    blue: "from-blue-600 to-indigo-700 shadow-blue-200",
    purple: "from-purple-600 to-violet-700 shadow-purple-200",
    emerald: "from-emerald-600 to-teal-700 shadow-emerald-200"
  }
  
  return (
    <div className={`bg-gradient-to-br ${styles[color]} p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}>
       <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
             <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                {icon}
             </div>
             <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> {delta}
             </div>
          </div>
          <p className="text-white/60 text-[10px] uppercase font-bold tracking-[0.2em] mb-1">{title}</p>
          <h2 className="text-4xl font-bold tabular-nums">{value}</h2>
       </div>
       {/* Decorative radial blur */}
       <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500"></div>
    </div>
  )
}

function ProviderCard({ name, logo, color, amount, share }) {
   const colors = {
      blue: "text-blue-600 bg-blue-50 border-blue-100",
      emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
      purple: "text-purple-600 bg-purple-50 border-purple-100",
      amber: "text-amber-600 bg-amber-50 border-amber-100"
   }
   return (
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
         <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-xl border ${colors[color]}`}>
               {logo}
            </div>
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{name}</p>
         </div>
         <h4 className="text-xl font-bold text-slate-900 mb-1 tabular-nums">{amount}</h4>
         <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Share of Wallet</span>
            <span className="text-[10px] font-black text-slate-900">{share}</span>
         </div>
         <div className="mt-3 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 group-hover:opacity-80`} style={{width: share, backgroundColor: 'currentColor'}}></div>
         </div>
      </div>
   )
}

function CustomTooltip({ active, payload, label }) {
   if (active && payload && payload.length) {
      return (
         <div className="bg-slate-900 p-4 rounded-2xl shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xl font-black text-white italic">₹{payload[0].value.toLocaleString()}</p>
         </div>
      )
   }
   return null
}