"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import DataTable from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Calendar } from "lucide-react"

export default function Page(){

  const [stats,setStats] = useState(null)
  const [recentBookings,setRecentBookings] = useState([])
  const [chartData,setChartData] = useState([])

  const columns = [
    { key:"customer", label:"Customer" },
    { key:"pickup", label:"Pickup" },
    { key:"drop", label:"Drop" },
    { key:"car", label:"Car" },
    { key:"status", label:"Status" }
  ]

  useEffect(()=>{

    async function loadDashboard(){

      try{

        const dashboard = await api("/stats")

        setStats({
          users: dashboard.users,
          bookings: dashboard.bookings,
          cars: dashboard.cars,
          cities: dashboard.cities,
          revenue: dashboard.revenue
        })

        const tableData = (dashboard.recentBookings || []).map(b => ({
          id: b.id,
          customer: b.user?.name || "—",
          pickup: b.pickupAddress,
          drop: b.dropAddress,
          car: b.carCategory?.name || "—",
          status: b.status
        }))

        setRecentBookings(tableData)

        const months = dashboard.monthlyBookings || []

        const formattedChart = months.map(m => ({
          name: m.month,
          value: Number(m.bookings)
        }))

        setChartData(formattedChart)

      }catch(err){

        console.error("Dashboard load error:",err)

      }

    }

    loadDashboard()

  },[])


  if(!stats){
    return <p className="p-6">Loading dashboard...</p>
  }

  return(

     <div className="flex flex-1 flex-col w-full bg-slate-50 min-h-[calc(100vh-4rem)]">

       <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-6 py-6 md:py-8 px-4 md:px-8">

         {/* 🌟 Welcome Hero */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-[1.5rem] shadow-sm border border-slate-200">
           <div>
             <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
               System Overview
             </h2>
             <p className="text-slate-500 font-medium text-sm mt-1 lg:mt-2">
               Monitor live fleet metrics, track realtime revenue, and manage operational anomalies.
             </p>
           </div>
           
           <button className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors shadow-sm w-fit">
             <Calendar className="w-4 h-4 text-blue-600" />
             Today: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
           </button>
         </div>

         {/* 📊 CARDS LAYER */}
         <div className="w-full">
           <SectionCards stats={stats} />
         </div>

         {/* 📋 TABLE LAYER */}
         <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-200 overflow-hidden mt-2">
           <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Dispatch Queue</h3>
             <button className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors">
               View All
             </button>
           </div>
           
           <div className="p-4">
             <DataTable
               columns={columns}
               data={recentBookings}
             />
           </div>
         </div>

       </div>

     </div>


  )

}