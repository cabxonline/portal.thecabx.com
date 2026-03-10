"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import DataTable from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

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

     <div className="flex flex-1 flex-col w-full">

          <div className="@container/main flex flex-1 flex-col gap-2">

            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

              {/* CARDS */}

             <SectionCards stats={stats} />
         

              {/* TABLE */}

              <div className="px-4 lg:px-6">
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