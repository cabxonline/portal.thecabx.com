"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export default function Bookings() {

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {

    async function fetchBookings() {
      try {
        const data = await api("/bookings")
        // Robust state injection in case API returns a wrapped { data: [...] }
        setBookings(Array.isArray(data) ? data : (data?.data || []))
      } catch (error) {
        console.error("Registry fetch error:", error)
      } finally {

        setLoading(false)

      }

    }

    fetchBookings()

  }, [])

  const filteredBookings = bookings.filter((booking) => {

    const matchSearch =
      booking.pickupAddress.toLowerCase().includes(search.toLowerCase()) ||
      booking.dropAddress.toLowerCase().includes(search.toLowerCase())

    const matchStatus =
      statusFilter === "all" || booking.status === statusFilter

    return matchSearch && matchStatus

  })


  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50">
        <div className="flex flex-col items-center gap-4">
           <svg className="animate-spin w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
             <path d="M21 12a9 9 0 11-4-7.5" />
           </svg>
           <p className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center">Interrogating <br/> Database</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col w-full bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-[1400px] mx-auto py-6 md:py-8 px-4 md:px-8">

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Active Bookings Registry</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Manage network bookings, dispatch orders, and track fare generation.</p>
          </div>

          <a
            href="/dashboard/bookings/create"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all active:scale-95"
          >
            Create Booking +
          </a>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap items-center gap-4 mb-6 bg-white p-4 rounded-[1rem] shadow-sm border border-slate-200">
          <input
            placeholder="Search by pickup or drop location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[240px] px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium placeholder-slate-400"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-w-[160px] px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:bg-white focus:border-blue-500 font-medium text-slate-700 font-bold focus:ring-4 focus:ring-blue-50 transition-all appearance-none"
          >
            <option value="all">💳 All Statuses</option>
            <option value="pending">🟡 Pending</option>
            <option value="confirmed">🔵 Confirmed</option>
            <option value="completed">🟢 Completed</option>
            <option value="cancelled">🔴 Cancelled</option>
          </select>
        </div>

        {/* DATA GRID */}
        <div className="bg-white rounded-[1.5rem] shadow-[0_5px_30px_-15px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Route</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Class</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Dispatch</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Fare</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400 font-medium">No bookings found matching your filters.</td>
                  </tr>
                )}
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                       <div className="flex flex-col gap-1">
                          <span className="font-semibold text-slate-900 border-l-2 border-slate-300 pl-2 leading-none">{booking.pickupAddress}</span>
                          <span className="font-semibold text-slate-500 border-l-2 border-blue-500 pl-2 leading-none mt-1">{booking.dropAddress}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {booking.user?.name || "Guest User"}
                    </td>
                    <td className="px-6 py-4">
                      {booking.carCategory?.name ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600">
                          🚘 {booking.carCategory.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm font-medium">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {booking.driver ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-slate-900 border-l-2 border-emerald-500 pl-2 leading-none">✅ {booking.driver.name}</span>
                          <span className="text-[10px] font-bold text-slate-500 border-l-2 border-transparent pl-2">{booking.driver.phone || "No Phone"}</span>
                        </div>
                      ) : (
                        <span className="inline-block text-[10.5px] font-black uppercase tracking-widest text-slate-400 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border
                        ${
                          booking.status === "completed"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : booking.status === "pending"
                            ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                            : booking.status === "cancelled"
                            ? "bg-rose-50 text-rose-600 border-rose-200"
                            : "bg-blue-50 text-blue-600 border-blue-200"
                        }
                        `}
                      >
                        {booking.status === "completed" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        {booking.status === "pending" && <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />}
                        {booking.status === "confirmed" && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                        {booking.status === "cancelled" && <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900 text-right">
                      {booking.fare ? `₹${booking.fare}` : <span className="text-slate-300 font-medium">Pending</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                         <a href={`/dashboard/bookings/${booking.id}/show`} className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors">
                           Manage
                         </a>
                      </div>
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