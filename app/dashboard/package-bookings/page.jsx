"use client"

import { useEffect, useState, Suspense } from "react"
import { api } from "@/lib/api"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Tag, MapPin, CheckCircle2, Navigation, User, Phone, Mail, Clock, CreditCard } from "lucide-react"

const statusConfig = {
  new_booking: { color: "bg-slate-100 text-slate-700 border-slate-200", row: "bg-white", icon: "🆕", label: "New Booking" },
  confirmed: { color: "bg-blue-100 text-blue-700 border-blue-200", row: "bg-blue-50/20", icon: "🔵", label: "Confirmed" },
  dispatched: { color: "bg-indigo-100 text-indigo-700 border-indigo-200", row: "bg-indigo-50/10", icon: "🚚", label: "Dispatched" },
  completed: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", row: "bg-emerald-50/40", icon: "🟢", label: "Completed" },
  cancelled: { color: "bg-rose-100 text-rose-700 border-rose-200", row: "bg-rose-50/50", icon: "🔴", label: "Cancelled" }
}

function PackageBookingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusFromQuery = searchParams.get("status") || "all"

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState(statusFromQuery)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    setStatusFilter(statusFromQuery)
  }, [statusFromQuery])

  const loadBookings = async () => {
    try {
      const data = await api("/bookings?type=package")
      setBookings(Array.isArray(data) ? data : (data?.data || []))
    } catch (error) {
      console.error("Registry fetch error:", error)
      toast.error("Failed to fetch package bookings")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChangeFilter = (newStatus) => {
    setStatusFilter(newStatus)
    const params = new URLSearchParams(searchParams.toString())
    if (newStatus === "all") {
      params.delete("status")
    } else {
      params.set("status", newStatus)
    }
    router.push(`/dashboard/package-bookings?${params.toString()}`)
  }

  const handleInlineStatusUpdate = async (id, newStatus) => {
    try {
      setUpdatingId(id)
      await api(`/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus, adminName: "Admin Console" })
      })
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b))
    } catch (err) {
      toast.error("Status update failed")
    } finally {
      setUpdatingId(null)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const filteredBookings = bookings.filter((booking) => {
    const searchLow = search.toLowerCase()
    const matchSearch =
      booking.bookingNumber.toLowerCase().includes(searchLow) ||
      booking.guestName?.toLowerCase().includes(searchLow) ||
      booking.mobileNumber?.toLowerCase().includes(searchLow) ||
      booking.package?.title?.toLowerCase().includes(searchLow)

    const matchStatus = statusFilter === "all" || booking.status === statusFilter
    return matchSearch && matchStatus
  })

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center">Loading Package Bookings</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="w-full px-4 md:px-8 py-6 md:py-8">

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Package Bookings <div className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-md tracking-widest uppercase italic border border-indigo-200">Tours & Travels</div>
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Manage and audit all reservations made for curated tour packages.</p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap items-center gap-4 mb-8 bg-white p-5 rounded-[2rem] shadow-sm border border-slate-200">
          <div className="flex-1 min-w-[300px] relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              placeholder="Search by ID, Customer, Phone or Package Title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all font-bold placeholder-slate-400 shadow-inner"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => handleStatusChangeFilter(e.target.value)}
            className="min-w-[200px] px-5 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none focus:bg-white focus:border-indigo-500 font-black text-slate-700 uppercase focus:ring-4 focus:ring-indigo-50 transition-all appearance-none cursor-pointer tracking-widest"
          >
            <option value="all">🌍 All Packages</option>
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
            ))}
          </select>
        </div>

        {/* DATA GRID */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap table-auto min-w-[1200px]">
              <thead className="bg-slate-50/80 border-b border-slate-100 uppercase text-[10px] font-bold tracking-widest text-slate-400">
                <tr>
                  <th className="px-6 py-5">Settlement</th>
                  <th className="px-6 py-5">Booking ID & Date</th>
                  <th className="px-6 py-5">Customer Profile</th>
                  <th className="px-6 py-5">Package Info</th>
                  <th className="px-6 py-5">Fleet & Driver</th>
                  <th className="px-6 py-5">Financial Audit</th>
                  <th className="px-6 py-5">Status Engine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-24 text-slate-300 font-bold uppercase tracking-widest">
                      <div className="flex flex-col items-center gap-2">
                        <MapPin className="w-12 h-12 opacity-10" />
                        No Package Bookings Found
                      </div>
                    </td>
                  </tr>
                )}
                {filteredBookings.map((booking) => {
                  const totalPaid = (booking.payments || [])
                    .filter(p => p.status === "paid")
                    .reduce((sum, p) => sum + Number(p.amount), 0);

                  const grandTotal = Number(booking.grandTotal || 0);
                  const totalDue = grandTotal - totalPaid;

                  const config = statusConfig[booking.status] || { row: "bg-white", color: "bg-slate-100 text-slate-400" };

                  return (
                    <tr key={booking.id} className={`transition-all duration-300 group hover:brightness-[0.98] ${config.row}`}>
                      {/* Settlement (Actions) */}
                      <td className="px-6 py-6 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <a
                            href={`/dashboard/bookings/${booking.id}/show`}
                            className="p-3 bg-white hover:bg-slate-900 border border-slate-200 text-slate-400 hover:text-white rounded-2xl shadow-sm transition-all hover:-translate-y-1 active:scale-95 group/btn"
                            title="Audit Management"
                          >
                            <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </a>
                        </div>
                      </td>
                      {/* Intel & Time */}
                      <td className="px-6 py-6 border-l-4 border-transparent group-hover:border-indigo-500 transition-all">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="bg-slate-900 text-white px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">{booking.bookingNumber}</span>
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mt-1 uppercase tracking-normal">
                            Booked: {new Date(booking.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-sm font-bold text-indigo-600 flex items-center gap-1 mt-1">
                            ⏰ {booking.scheduledAt ? new Date(booking.scheduledAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : "IMMEDIATE"} • {booking.pickupTime || "TBD"}
                          </span>
                        </div>
                      </td>

                      {/* Customer Profile */}
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-slate-900 text-base leading-none flex items-center gap-2">
                            {booking.guestName || booking.user?.name || "Anonymous Guest"}
                            {booking.gender && <span className="text-[10px] px-1 bg-slate-100 text-slate-400 rounded-sm">{booking.gender.charAt(0)}</span>}
                          </span>
                          <span className="text-sm font-semibold text-slate-500 flex items-center gap-1 mt-1">📞 {booking.mobileNumber}</span>
                          {booking.email && <span className="text-xs font-medium text-slate-400 flex items-center gap-1 lowercase tracking-tight">{booking.email}</span>}
                        </div>
                      </td>

                      {/* Package Info */}
                      <td className="px-6 py-6 max-w-xs overflow-hidden">
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 mb-1">
                                <Tag className="w-4 h-4 text-indigo-500"/>
                                <span className="text-sm font-black text-slate-900 truncate" title={booking.package?.title}>{booking.package?.title || "Unknown Package"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">{booking.package?.duration || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-rose-400"/>
                                <p className="text-[11px] font-bold text-slate-600 truncate">Pickup: {booking.pickupAddress}</p>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Fleet Assets */}
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 rounded uppercase tracking-widest flex items-center gap-1">
                              🚗 {booking.carCategory?.name || "NONE"}
                            </span>
                          </div>
                          {booking.driver ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-bold text-slate-800">👤 {booking.driver.name}</span>
                              <span className="text-xs font-medium text-slate-500 uppercase tracking-normal">🆔 {booking.car?.model} ({booking.car?.plateNumber})</span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-300 uppercase italic tracking-widest">Awaiting Assignment</span>
                          )}
                        </div>
                      </td>

                      {/* Financial Audit */}
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-1 text-right">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-normal">Package Total</span>
                            <span className="text-base font-bold text-slate-900">₹{booking.fare}</span>
                          </div>
                          <div className="flex flex-col mt-1">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-normal">Amount Paid</span>
                            <span className="text-sm font-bold text-emerald-600">₹{totalPaid}</span>
                          </div>
                          <div className="flex flex-col mt-1 border-t border-slate-100 pt-1">
                            <span className="text-[10px] font-bold text-rose-300 uppercase tracking-normal">Pending Due</span>
                            <span className="text-sm font-bold text-rose-600">₹{(booking.fare) - totalPaid}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status Engine */}
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-2 relative">
                          {updatingId === booking.id ? (
                            <div className="px-4 py-2 bg-slate-100 rounded-xl animate-pulse w-32 h-8" />
                          ) : (
                            <div className="relative w-fit">
                              <select
                                value={booking.status}
                                onChange={(e) => handleInlineStatusUpdate(booking.id, e.target.value)}
                                className={`
                                    pl-3 pr-8 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all appearance-none cursor-pointer outline-none
                                    ${config.color}
                                  `}
                              >
                                {Object.entries(statusConfig).map(([val, cfg]) => (
                                  <option key={val} value={val}>{cfg.label}</option>
                                ))}
                              </select>
                              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                          )}
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border w-fit ${booking.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                            💰 {booking.paymentStatus}
                          </span>
                        </div>
                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function PackageBookings() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center">Loading <br /> Packages</p>
        </div>
      </div>
    }>
      <PackageBookingsContent />
    </Suspense>
  )
}
