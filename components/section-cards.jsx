"use client"

import Link from "next/link"
import { TrendingUp, TrendingDown, Users, Wallet, ClipboardCheck, MapPin } from "lucide-react"

export function SectionCards({ stats }) {

  const cards = [
    {
      title: "Total Revenue",
      value: `₹${(stats?.revenue ?? 0).toLocaleString()}`,
      trend: "+12.5%",
      up: true,
      description: "Total platform revenue",
      link: "/dashboard/analytics/revenue",
      icon: <Wallet className="w-5 h-5" />,
      color: "blue"
    },
    {
      title: "Active Customers",
      value: (stats?.users ?? 0).toLocaleString(),
      trend: "+8.2%",
      up: true,
      description: "Registered platform users",
      link: "/dashboard/customers",
      icon: <Users className="w-5 h-5" />,
      color: "indigo"
    },
    {
      title: "Total Bookings",
      value: (stats?.bookings ?? 0).toLocaleString(),
      trend: "+15.0%",
      up: true,
      description: "Mission-critical dispatches",
      link: "/dashboard/bookings",
      icon: <ClipboardCheck className="w-5 h-5" />,
      color: "emerald"
    },
    {
      title: "Operating Cities",
      value: "12",
      trend: "+3.1%",
      up: true,
      description: "Active service nodes",
      link: "/dashboard/fleet",
      icon: <MapPin className="w-5 h-5" />,
      color: "rose"
    }
  ]

  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-500/5",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-500/5",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-emerald-500/5",
    rose: "bg-rose-50 text-rose-600 border-rose-100 shadow-rose-500/5"
  }

  const iconBgMap = {
    blue: "bg-blue-600 shadow-blue-500/20",
    indigo: "bg-indigo-600 shadow-indigo-500/20",
    emerald: "bg-emerald-600 shadow-emerald-500/20",
    rose: "bg-rose-600 shadow-rose-500/20"
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 px-0">
      {cards.map((card, i) => (
        <Link key={i} href={card.link}>
          <div className={`group relative bg-white border border-slate-200 p-6 rounded-[2rem] hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 active:scale-[0.98]`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl ${iconBgMap[card.color]} text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-300`}>
                {card.icon}
              </div>
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${card.up ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                {card.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {card.trend}
              </div>
            </div>
            
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{card.title}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight tabular-nums mb-2">{card.value}</h3>
            <p className="text-xs font-medium text-slate-500 line-clamp-1">{card.description}</p>

            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}