"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { MapPin, User, Car, Navigation, ShieldCheck, ChevronLeft, CalendarClock, CreditCard, Banknote, Link as LinkIcon, Download, History, RefreshCcw, XCircle, CalendarDays, Key } from "lucide-react"

export default function ShowBooking() {
  const { id } = useParams()
  const router = useRouter()

  const [booking, setBooking] = useState(null)
  const [drivers, setDrivers] = useState([])
  const [selectedDriver, setSelectedDriver] = useState("")
  const [dispatching, setDispatching] = useState(false)
  const [isReassigning, setIsReassigning] = useState(false)
  
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [operationLoading, setOperationLoading] = useState(false)
  
  const [paymentActionLoading, setPaymentActionLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [bData, dData] = await Promise.all([
        api(`/bookings/${id}`),
        api(`/drivers`)
      ])
      
      const safeBooking = bData?.data || bData
      setBooking(safeBooking)
      
      const extractedDrivers = Array.isArray(dData) ? dData : (dData?.data || dData?.drivers || [])
      setDrivers(Array.isArray(extractedDrivers) ? extractedDrivers : [])
      
      if (safeBooking?.driverId) {
        setSelectedDriver(safeBooking.driverId)
      }
    } catch (err) {
      console.error("Booking load error:", err)
      toast.error("Failed to load booking details")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleDispatch = async () => {
    if (!selectedDriver) {
      toast.error("Please select a driver first.")
      return
    }
    
    try {
      setDispatching(true)
      await api(`/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          driverId: selectedDriver,
          status: "confirmed"
        })
      })
      toast.success(isReassigning ? "Driver reassigned securely!" : "Driver dispatched securely!")
      setIsReassigning(false)
      await loadData()
    } catch (err) {
      console.error(err)
      toast.error("Failed to dispatch driver")
    } finally {
      setDispatching(false)
    }
  }

  const handleCashCollection = async () => {
    try {
      setPaymentActionLoading(true)
      const res = await api(`/bookings/${id}/payment/cash`, { method: "POST" })
      toast.success(res.message || "Cash collection logged!")
      await loadData()
    } catch (err) {
      toast.error(err.message || "Failed to log cash")
    } finally {
      setPaymentActionLoading(false)
    }
  }

  const handleSendLink = async () => {
    try {
      setPaymentActionLoading(true)
      const res = await api(`/bookings/${id}/payment/link`, { method: "POST" })
      toast.success(res.message || "Payment Link dispatched!")
    } catch (err) {
      toast.error(err.message || "Failed to dispatch link")
    } finally {
      setPaymentActionLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!confirm("Are you entirely sure you wish to cancel this ticket? It will immediately unlink drivers and dispatch notifications.")) return
    
    try {
      setOperationLoading(true)
      await api(`/bookings/${id}/cancel`, { method: "POST" })
      toast.success("Ticket explicitly cancelled.")
      await loadData()
    } catch (err) {
      toast.error(err.message || "Failed to cancel ticket.")
    } finally {
      setOperationLoading(false)
    }
  }

  const handleRescheduleBooking = async () => {
    if (!rescheduleDate) return toast.error("Please explicitly declare a valid datetime.")
    
    try {
      setOperationLoading(true)
      await api(`/bookings/${id}/reschedule`, {
        method: "POST",
        body: JSON.stringify({ scheduledDate: rescheduleDate })
      })
      toast.success("Ticket efficiently rescheduled!")
      setIsRescheduleModalOpen(false)
      await loadData()
    } catch (err) {
      toast.error(err.message || "Failed to execute reschedule.")
    } finally {
      setOperationLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50">
        <div className="flex flex-col items-center gap-4">
           <svg className="animate-spin w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
             <path d="M21 12a9 9 0 11-4-7.5" />
           </svg>
           <p className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center">Loading Ticket <br/> Details</p>
        </div>
      </div>
    )
  }

  if (!booking) return <p className="p-8 text-slate-500 font-medium">Ticket {id} not found.</p>

  // Compute Finances
  const amountPaid = (booking?.payments || [])
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0)
    
  const pendingDues = (booking?.fare || 0) - amountPaid

  return (
    <div className="flex flex-1 flex-col w-full bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-[1400px] mx-auto py-6 md:py-8 px-4 md:px-8">

        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard/bookings')}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Ticket #{booking?.id?.split('-')?.[0] || "Unknown"}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border
                  ${
                    booking?.status === "completed"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : booking?.status === "pending"
                      ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                      : booking?.status === "cancelled"
                      ? "bg-rose-50 text-rose-600 border-rose-200"
                      : "bg-blue-50 text-blue-600 border-blue-200"
                  }`}
                >
                  {booking?.status || "Processing"}
                </span>
              </div>
              <p className="text-slate-500 font-medium text-sm mt-0.5">
                Created on {booking?.createdAt ? new Date(booking.createdAt).toLocaleString() : "System Date"}
              </p>
            </div>
          </div>
          
          {/* Operations Header */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setIsRescheduleModalOpen(true)}
              disabled={booking?.status === "cancelled" || operationLoading}
              className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 font-bold text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              <CalendarDays className="w-4 h-4" />
              Reschedule
            </button>
            <button 
              onClick={handleCancelBooking}
              disabled={booking?.status === "cancelled" || operationLoading}
              className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              <XCircle className="w-4 h-4" />
              Cancel Booking
            </button>
          </div>
        </div>

        {/* Reschedule Modal Layer */}
        {isRescheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100">
               <h3 className="text-xl font-black text-slate-900 mb-2">Reschedule Ticket</h3>
               <p className="text-sm font-medium text-slate-500 mb-6">Dispatching a new schedule will natively trigger automated network notifications securely.</p>
               
               <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Assigned Datetime</label>
               <input 
                 type="datetime-local" 
                 value={rescheduleDate}
                 onChange={(e) => setRescheduleDate(e.target.value)}
                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-bold text-slate-700 mb-6"
               />
               
               <div className="flex gap-3">
                 <button 
                   onClick={() => setIsRescheduleModalOpen(false)}
                   className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50"
                 >
                   Disregard
                 </button>
                 <button 
                   onClick={handleRescheduleBooking}
                   disabled={operationLoading}
                   className="flex-1 py-3 bg-blue-600 rounded-xl font-bold text-sm text-white hover:bg-blue-700"
                 >
                   Confirm Sync
                 </button>
               </div>
            </div>
          </div>
        )}

        {/* Main Grid Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT PANE */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Route Box */}
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-200">
               <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                 <Navigation className="w-5 h-5 text-blue-600" />
                 Travel Itinerary
               </h2>
               
               <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-slate-300 border-2 border-white ring-2 ring-slate-100"></div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Pickup Location</p>
                    <p className="text-slate-900 font-medium">{booking?.pickupAddress || "N/A"}</p>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white ring-2 ring-blue-100 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Drop-off Location</p>
                    <p className="text-slate-900 font-medium">{booking?.dropAddress || "N/A"}</p>
                  </div>
                  
                  {booking?.scheduledAt && (
                    <div className="relative mt-8">
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-purple-500 border-2 border-white ring-2 ring-purple-100"></div>
                      <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5" /> Force Scheduled
                      </p>
                      <p className="text-slate-900 font-bold">{new Date(booking.scheduledAt).toLocaleString()}</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Financial Overview & Resolution Grid */}
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-200">
               <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                 <CreditCard className="w-5 h-5 text-emerald-600" />
                 Financial Resolution
               </h2>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Fare</p>
                     <p className="font-black text-xl text-slate-900">₹{booking?.fare || "0.00"}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                     <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mb-1">Clearance Configured</p>
                     <p className="font-black text-xl text-emerald-700">₹{amountPaid.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 shadow-sm relative overflow-hidden">
                     <div className="absolute -right-4 -bottom-4 opacity-10"><Banknote className="w-24 h-24 text-amber-500" /></div>
                     <p className="text-[10px] font-bold text-amber-700/70 uppercase tracking-widest mb-1 relative">Pending Dues</p>
                     <p className="font-black text-2xl text-amber-700 relative">₹{pendingDues > 0 ? pendingDues.toFixed(2) : "0.00"}</p>
                  </div>
               </div>

               {/* Admin Action Engine */}
               {pendingDues > 0 && (
                 <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
                    <button 
                      onClick={handleCashCollection}
                      disabled={paymentActionLoading || !booking?.driverId}
                      className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {booking?.driverId ? "Driver Collected Cash" : "Dispatch Driver First"}
                    </button>
                    
                    <button 
                      onClick={handleSendLink}
                      disabled={paymentActionLoading}
                      className="flex-1 py-3 px-4 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 font-bold text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Email Razorpay Link
                    </button>
                 </div>
               )}
            </div>

            {/* AUDIT TRAIL */}
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-200">
               <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                 <History className="w-5 h-5 text-slate-400" />
                 System Audit Trail
               </h2>

               <div className="space-y-4">
                 {booking?.logs?.length > 0 ? (
                   booking.logs.map((log) => (
                     <div key={log.id} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                       <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0 text-[10px]">
                         {log.action === "DISPATCH" || log.action === "REASSIGN" ? "🚜" : "💳"}
                       </div>
                       <div>
                         <p className="font-bold text-slate-800 text-sm mb-0.5">{log.message}</p>
                         <p className="text-xs font-medium text-slate-400">
                           {log.createdAt ? new Date(log.createdAt).toLocaleString() : "Unknown"}
                         </p>
                       </div>
                     </div>
                   ))
                 ) : (
                   <p className="text-sm font-medium text-slate-400 italic text-center py-4">No major actions logged yet.</p>
                 )}
               </div>
            </div>

          </div>

          {/* RIGHT PANE: DISPATCH MODULE */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Passenger Details Mini-Card */}
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-200">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                   <User className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-0.5">Primary Passenger</p>
                    <p className="font-black text-slate-900 text-lg">{booking?.user?.name || "Guest"}</p>
                    <p className="text-xs font-bold text-slate-500">{booking?.user?.phone || booking?.user?.email || "No Contact"}</p>
                 </div>
               </div>
            </div>


            {/* DISPATCH CONTROLLER */}
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-200 sticky top-24">
              
              <div className="flex items-center justify-between mb-5">
                 <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-inner">
                    <ShieldCheck className="w-6 h-6" />
                 </div>
                 <div className="text-right">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5 justify-end">
                     <Car className="w-3.5 h-3.5" /> Class Requested
                   </p>
                   <p className="font-bold text-slate-900 truncate">{booking?.carCategory?.name || "Any Category"}</p>
                 </div>
              </div>

              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">Fleet Authority</h2>
              
              {!booking?.driverId || isReassigning ? (
                <>
                  <p className="text-sm text-slate-500 font-medium mb-6">Allocate a verified driver and vehicle to officially execute this booking.</p>

                  <div className="space-y-4">
                    {/* Driver Selection */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1 flex items-center justify-between">
                        <span>Select Available Driver</span>
                        {isReassigning && (
                          <button onClick={() => setIsReassigning(false)} className="text-rose-500 hover:text-rose-600">Cancel</button>
                        )}
                      </label>
                      <div className="relative">
                        <select
                          value={selectedDriver}
                          onChange={(e) => setSelectedDriver(e.target.value)}
                          disabled={booking?.status === "completed" || booking?.status === "cancelled"}
                          className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-700 appearance-none disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
                        >
                          <option value="" disabled>-- Unassigned Pool --</option>
                          {Array.isArray(drivers) && drivers.map(d => (
                             <option key={d.id} value={d.id}>
                               {d.name} {d.phone ? `(${d.phone})` : ""}
                             </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleDispatch}
                      disabled={dispatching || !selectedDriver || booking?.status === "completed" || booking?.status === "cancelled"}
                      className="w-full mt-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]"
                    >
                      {dispatching ? "Dispatching..." : "Confirm Dispatch"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-500 font-medium mb-5">This ticket has been firmly allocated to the following fleet operative.</p>
                  
                  {/* Driver HUD Card */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-3 flex items-center gap-3">
                        <button 
                          onClick={() => setIsReassigning(true)}
                          className="p-1.5 bg-white/60 hover:bg-white rounded-lg text-emerald-700 transition-colors shadow-sm"
                          title="Reassign Driver"
                        >
                          <RefreshCcw className="w-3.5 h-3.5" />
                        </button>
                        <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                     </div>
                     <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mb-3">Allocated Personnel</p>
                     
                     <div className="flex flex-col gap-1">
                        <h3 className="font-black text-xl text-emerald-900">{booking.driver?.name || "Verified Operative"}</h3>
                        <p className="font-bold text-emerald-700 tracking-tight">{booking.driver?.phone || "No Active Comms"}</p>
                     </div>
                     
                     <div className="mt-4 pt-4 border-t border-emerald-200/50">
                        <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                           <Car className="w-3.5 h-3.5" /> Assigned Vehicle
                        </p>
                        <p className="font-bold text-emerald-800">
                          {booking.driver?.car?.model || "Standard Tier Fleet"}
                        </p>
                     </div>
                  </div>
                </>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  )
}