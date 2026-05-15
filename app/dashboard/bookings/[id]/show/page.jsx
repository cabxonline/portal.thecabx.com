"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { MapPin, User, Car, Navigation, ShieldCheck, ChevronLeft, CalendarClock, CreditCard, Banknote, Link as LinkIcon, Download, History, RefreshCcw, XCircle, CalendarDays, Key, Zap, Box, ChevronRight, Phone, Mail, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export default function ShowBooking() {
  const { id } = useParams()
  const router = useRouter()

  const [booking, setBooking] = useState(null)
  const formatDateTimeForInput = (date) => {
    if (!date) return ""
    const d = new Date(date)
    // Adjust for timezone offset to get YYYY-MM-DDTHH:mm in local time
    const offset = d.getTimezoneOffset() * 60000
    const localISODate = new Date(d.getTime() - offset).toISOString().slice(0, 16)
    return localISODate
  }
  const [drivers, setDrivers] = useState([])
  const [cars, setCars] = useState([])
  const [selectedDriver, setSelectedDriver] = useState("")
  const [selectedCar, setSelectedCar] = useState("")
  const [allocationMode, setAllocationMode] = useState("default") // default | separate
  const [searchDriver, setSearchDriver] = useState("")
  const [searchCar, setSearchCar] = useState("")
  const [isDriverDropdownOpen, setIsDriverDropdownOpen] = useState(false)
  const [isCarDropdownOpen, setIsCarDropdownOpen] = useState(false)

  const [dispatching, setDispatching] = useState(false)
  const [isReassigning, setIsReassigning] = useState(false)

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [operationLoading, setOperationLoading] = useState(false)

  const [paymentActionLoading, setPaymentActionLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  const [statusToUpdate, setStatusToUpdate] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const [extraKmCost, setExtraKmCost] = useState(0)
  const [tollsCost, setTollsCost] = useState(0)
  const [totalKm, setTotalKm] = useState(0)
  const [costPerKm, setCostPerKm] = useState(0)
  const [savingFinancials, setSavingFinancials] = useState(false)
  const [collectionAmount, setCollectionAmount] = useState("")
  const [tytRate, setTytRate] = useState(0)
  const [multiplyBy, setMultiplyBy] = useState(1)
  const [bookingGender, setBookingGender] = useState("")
  const [bookingPickupTime, setBookingPickupTime] = useState("")

  const loadData = async () => {
    try {
      const [bData, dData, cData] = await Promise.all([
        api(`/bookings/${id}`),
        api(`/drivers`),
        api(`/cars`)
      ])

      const safeBooking = bData?.data || bData
      setBooking(safeBooking)
      setStatusToUpdate(safeBooking?.status || "")
      setExtraKmCost(safeBooking?.extraKmCost || 0)
      setTollsCost(safeBooking?.tollsCost || 0)
      setTotalKm(safeBooking?.totalKm || 0)
      setCostPerKm(safeBooking?.costPerKm || 0)
      setTytRate(safeBooking?.tytRate || 0)
      setMultiplyBy(safeBooking?.multiplyBy || 1)
      setBookingGender(safeBooking?.gender || "")
      setBookingPickupTime(safeBooking?.pickupTime || "")

      const extractedDrivers = Array.isArray(dData) ? dData : (dData?.data || dData?.drivers || [])
      setDrivers(Array.isArray(extractedDrivers) ? extractedDrivers : [])

      const extractedCars = Array.isArray(cData) ? cData : (cData?.data || cData?.cars || [])
      setCars(Array.isArray(extractedCars) ? extractedCars : [])

      if (safeBooking?.driverId) {
        setSelectedDriver(safeBooking.driverId)
      }

      if (safeBooking?.carId) {
        setSelectedCar(safeBooking.carId)
        // If assigned car is not the driver's default, switch to separate mode
        if (safeBooking.carId !== safeBooking.driver?.carId) {
          setAllocationMode("separate")
        }
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
          carId: selectedCar,
          status: "dispatched"
        })
      })
      toast.success(isReassigning ? "Fleet assignment updated!" : "Personnel and fleet successfully deployed!")
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
      const res = await api(`/bookings/${id}/payment/cash`, {
        method: "POST",
        body: JSON.stringify({ amount: collectionAmount })
      })
      toast.success(res.message || "Cash collection logged!")
      setCollectionAmount("")
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

  const handleDownloadInvoice = async () => {
    try {
      toast.loading("Generating Invoice...", { id: "invoice-toast" })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/bookings/${id}/invoice`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) throw new Error("Failed to fetch invoice from server")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Invoice_${booking.bookingNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success("Invoice downloaded successfully!", { id: "invoice-toast" })
    } catch (err) {
      console.error("PDF Generation Error:", err)
      toast.error("Failed to generate PDF. Check console for details.", { id: "invoice-toast" })
    }
  }

  const handleSendInvoice = async () => {
    try {
      toast.loading("Dispatching Secure Invoice...", { id: "send-invoice" })
      const res = await api(`/bookings/${id}/invoice/send`, { method: "POST" })
      toast.success(res.message || "Invoice securely dispatched!", { id: "send-invoice" })
    } catch (err) {
      toast.error(err.message || "Failed to dispatch invoice.", { id: "send-invoice" })
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

  const handleStatusUpdate = async () => {
    if (!statusToUpdate) return

    try {
      setUpdatingStatus(true)
      const userStr = localStorage.getItem("user")
      const user = userStr ? JSON.parse(userStr) : null
      const adminName = user?.name || "Admin"

      await api(`/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: statusToUpdate,
          adminName: adminName
        })
      })

      toast.success(`Status updated successfully to ${statusToUpdate.replace("_", " ")}`)
      await loadData()
    } catch (err) {
      console.error(err)
      toast.error("Failed to update status")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleSaveFinancials = async () => {
    try {
      setSavingFinancials(true)
      const userStr = localStorage.getItem("user")
      const user = userStr ? JSON.parse(userStr) : null
      const adminName = user?.name || "Admin"

      await api(`/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          extraKmCost: Number(totalKm) * Number(costPerKm),
          tollsCost: Number(tollsCost),
          totalKm: Number(totalKm),
          costPerKm: Number(costPerKm),
          tytRate: Number(tytRate),
          multiplyBy: Number(multiplyBy),
          gender: bookingGender,
          pickupTime: bookingPickupTime,
          adminName: adminName
        })
      })
      toast.success("Additional charges updated and logged!")
      await loadData()
    } catch (err) {
      console.error(err)
      toast.error("Failed to update additional charges")
    } finally {
      setSavingFinancials(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M21 12a9 9 0 11-4-7.5" />
          </svg>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center">Loading Booking <br /> Details</p>
        </div>
      </div>
    )
  }

  if (!booking) return <p className="p-8 text-slate-500 font-medium">Ticket {id} not found.</p>

  // Compute Finances
  const amountPaid = (booking?.payments || [])
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0)

  const extraKmUsageCost = (Number(totalKm) * Number(costPerKm))
  const extraCharges = extraKmUsageCost + (Number(tollsCost) || 0)

  const totalFare = (booking?.fare || 0) + extraCharges

  const pendingDues = totalFare - amountPaid

  // Dynamic Fleet Lookup Logic
  const filteredDrivers = drivers.filter(d =>
    d.name?.toLowerCase().includes(searchDriver.toLowerCase()) ||
    d.phone?.includes(searchDriver)
  )

  const filteredCars = cars.filter(c =>
    c.model?.toLowerCase().includes(searchCar.toLowerCase()) ||
    c.plateNumber?.toLowerCase().includes(searchCar.toLowerCase())
  )

  const selectedDriverObj = drivers.find(d => d.id === selectedDriver)
  const selectedCarObj = cars.find(c => c.id === selectedCar)

  const selectDriver = (driver) => {
    setSelectedDriver(driver.id)
    setSearchDriver(driver.name || "")
    setIsDriverDropdownOpen(false)
    if (allocationMode === "default" && driver.carId) {
      setSelectedCar(driver.carId)
      setSearchCar(driver.car?.model || "")
    }
  }

  const selectCar = (car) => {
    setSelectedCar(car.id)
    setSearchCar(car.model || "")
    setIsCarDropdownOpen(false)
  }

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
                  {booking?.bookingNumber || booking?.id || "Unknown"}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border
                  ${booking?.status === "completed"
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

                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border
                  ${booking?.paymentStatus === "paid"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100 italic"
                      : "bg-amber-50 text-amber-600 border-amber-100"
                    }`}
                >
                  {booking?.paymentStatus === 'paid' ? "💳 Paid" : "⏳ Payment Pending"}
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
              onClick={() => {
                setRescheduleDate(formatDateTimeForInput(booking?.scheduledAt || booking?.createdAt))
                setIsRescheduleModalOpen(true)
              }}
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

              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5" /> Current Schedule
                </p>
                <p className="font-black text-slate-900">{booking?.scheduledAt ? new Date(booking.scheduledAt).toLocaleString() : new Date(booking.createdAt).toLocaleString()} <span className="text-slate-400 font-medium ml-1">({booking?.pickupTime || "TBD"})</span></p>
              </div>

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
                Travel Package
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

                {/* Route Metrics */}
                {(booking?.totalDistance || booking?.totalDuration) && (
                  <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Estimated Distance</p>
                      <p className="font-black text-slate-900 flex items-center gap-2">
                        <Navigation className="w-3.5 h-3.5 text-blue-500" />
                        {booking.totalDistance}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Estimated Duration</p>
                      <p className="font-black text-slate-900 flex items-center gap-2">
                        <CalendarClock className="w-3.5 h-3.5 text-indigo-500" />
                        {booking.totalDuration}
                      </p>
                    </div>
                  </div>
                )}

                {booking?.scheduledAt && (
                  <div className="relative mt-8">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-purple-500 border-2 border-white ring-2 ring-purple-100"></div>
                    <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" /> Force Scheduled
                    </p>
                    <p className="text-slate-900 font-bold">{new Date(booking.scheduledAt).toLocaleString()}</p>
                  </div>
                )}

                {(booking?.pickupTime && booking?.pickupTime !== "Not Specified") && (
                  <div className="relative mt-8">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white ring-2 ring-indigo-100"></div>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <CalendarClock className="w-3.5 h-3.5" /> Customer Selected Time
                    </p>
                    <p className="text-slate-900 font-black text-xl tracking-tight">{booking.pickupTime}</p>
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

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-slate-900 rounded-[1.25rem] border border-slate-800 shadow-xl shadow-slate-900/10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-blue-400" /> Grand Total
                  </p>
                  <p className="font-black text-2xl text-white italic">₹{totalFare.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-[1.25rem] border border-slate-100 italic">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Box className="w-3 h-3" /> T Extra Charged
                  </p>
                  <p className="font-black text-xl text-slate-900">₹{extraCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-[1.25rem] border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 font-sans">
                    <ShieldCheck className="w-3.5 h-3.5" /> Paid Settlement
                  </p>
                  <p className="font-black text-xl text-emerald-700">₹{amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>

                <div className="p-4 bg-amber-50 rounded-[1.25rem] border border-amber-200 shadow-sm relative overflow-hidden group/dues">
                  <div className="absolute -right-4 -bottom-4 opacity-10 group-hover/dues:scale-110 transition-transform"><Banknote className="w-24 h-24 text-amber-500" /></div>
                  <p className="text-[10px] font-black text-amber-700/70 uppercase tracking-widest mb-1.5 relative">Pending Dues</p>
                  <p className="font-black text-2xl text-amber-700 relative italic">₹{pendingDues > 0 ? pendingDues.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "0.00"}</p>
                </div>
              </div>

              {/* Charges Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 mb-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Total KM</label>
                  <input
                    type="number"
                    value={totalKm}
                    onChange={(e) => setTotalKm(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Rate per KM</label>
                  <input
                    type="number"
                    value={costPerKm}
                    onChange={(e) => setCostPerKm(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                {/* <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Extra KM Cost</label>
                    <input 
                      type="number"
                      value={extraKmCost}
                      onChange={(e) => setExtraKmCost(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                    />
                  </div> */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Tolls / Taxes</label>
                  <input
                    type="number"
                    value={tollsCost}
                    onChange={(e) => setTollsCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 italic text-blue-600">TYT Rate</label>
                  <input
                    type="number"
                    value={tytRate}
                    onChange={(e) => setTytRate(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-blue-50/50 border border-blue-100 rounded-xl text-xs font-black text-blue-600 outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 italic text-indigo-600">Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    value={multiplyBy}
                    onChange={(e) => setMultiplyBy(e.target.value)}
                    placeholder="1.0"
                    className="w-full px-4 py-2 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs font-black text-indigo-600 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 italic text-rose-500">Gender Identity</label>
                  <select
                    value={bookingGender}
                    onChange={(e) => setBookingGender(e.target.value)}
                    className="w-full px-4 py-2 bg-rose-50/30 border border-rose-100 rounded-xl text-xs font-black text-rose-600 outline-none focus:border-rose-500 transition-all appearance-none"
                  >
                    <option value="">Not Specified</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Update Pickup Time</label>
                  <div className="relative">
                    <select
                      value={bookingPickupTime}
                      onChange={(e) => setBookingPickupTime(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-slate-400 transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Select Time Slot</option>
                      {Array.from({ length: 48 }).map((_, i) => {
                        const hour = Math.floor(i / 2);
                        const min = i % 2 === 0 ? "00" : "30";
                        const ampm = hour >= 12 ? "PM" : "AM";
                        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                        const timeStr = `${displayHour}:${min} ${ampm}`;
                        return <option key={timeStr} value={timeStr}>{timeStr}</option>;
                      })}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-4">
                  <button
                    onClick={handleSaveFinancials}
                    disabled={savingFinancials}
                    className="w-full py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {savingFinancials ? "Syncing Financials..." : "Save Calculation & Update Audit"}
                  </button>
                  <p className="mt-2 text-center text-[10px] font-medium text-slate-400 italic"> Formula: (Total KM × Rate) + Tolls + Extra charges</p>
                </div>
              </div>

              {/* Admin Action Engine */}
              {pendingDues > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">₹</span>
                      <input
                        type="number"
                        placeholder="Amount (Partial or Full)"
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-slate-400"
                        value={collectionAmount}
                        onChange={(e) => setCollectionAmount(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={handleCashCollection}
                      disabled={paymentActionLoading || !booking?.driverId}
                      className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {booking?.driverId ? "Driver Collected Cash" : "Dispatch Driver First"}
                    </button>
                  </div>

                  <button
                    onClick={handleSendLink}
                    disabled={paymentActionLoading}
                    className="flex-1 py-3 px-4 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 font-bold text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Razorpay Link
                  </button>
                  <button
                    onClick={handleSendInvoice}
                    className="flex-1 py-3 px-4 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 hover:border-purple-300 font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Send Invoice
                  </button>
                  <button
                    onClick={handleDownloadInvoice}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              )}
            </div>

            {/* PAYMENT LEDGER */}
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-200">
              <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2 italic">
                <CreditCard className="w-5 h-5 text-indigo-600 font-normal" />
                Payment Record Ledger
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Reference</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Fulfillment Channel</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Settlement</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium italic">
                    {booking?.payments?.length > 0 ? (
                      booking.payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-4 py-4">
                            <p className="text-sm text-slate-900 font-black tracking-tight">{new Date(payment.createdAt).toLocaleDateString()} <span className="text-slate-400 font-bold ml-1">@{new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Ref: #{payment.transactionId || payment.id}</p>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                              payment.method === "cash" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-blue-50 text-blue-600 border-blue-100"
                            )}>
                              {payment.method === "cash" ? <Download className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
                              {payment.method === "cash" ? "Cash (Driver Collection)" : "Secure Link (Razorpay)"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <p className="text-sm font-black text-slate-900 italic">₹{payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                              payment.status === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                            )}>
                              {payment.status === "paid" ? "Captured" : payment.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest italic">No financial movements recorded</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AUDIT TRAIL */}
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-200">
              <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2 italic">
                <History className="w-5 h-5 text-slate-400 font-normal" />
                System Audit Trail
              </h2>

              <div className="space-y-4">
                {booking?.logs?.length > 0 ? (
                  booking.logs.map((log) => (
                    <div key={log.id} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0 text-[10px]">
                        {log.action === "DISPATCH" || log.action === "REASSIGN" ? "🚜" : log.action === "FINANCIAL_UPDATE" ? "💰" : "💳"}
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
                  <p className="font-black text-slate-900 text-lg leading-tight">{booking?.guestName || booking?.user?.name || "Guest"}</p>

                  <div className="flex flex-col gap-1 mt-2">
                    <a href={`tel:${booking?.mobileNumber || booking?.user?.phone}`} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1.5 font-sans">
                      <Phone className="w-3 h-3" /> {booking?.mobileNumber || booking?.user?.phone || "No Phone"}
                    </a>
                    <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5">
                      <Mail className="w-3 h-3" /> {booking?.user?.email || "No Email Provided"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-50">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest border border-slate-200">{booking?.gender || "Not Specified"}</span>
                    {booking?.corporateName && (
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest border border-indigo-100 flex items-center gap-1 group/corp relative cursor-help">
                        <Building2 className="w-3 h-3" /> Corporate
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover/corp:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                          {booking.corporateName}
                        </div>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Status Control */}
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-200">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <RefreshCcw className="w-5 h-5 text-purple-600" />
                Operational Status
              </h2>

              <div className="space-y-4">
                <div className="relative">
                  <select
                    value={statusToUpdate}
                    onChange={(e) => setStatusToUpdate(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                  >
                    <option value="new_booking">🆕 New Booking</option>
                    <option value="confirmed">🔵 Confirmed</option>
                    <option value="dispatched">🚚 Dispatched</option>
                    <option value="completed">🟢 Completed</option>
                    <option value="cancelled">🔴 Cancelled</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </div>
                </div>

                <button
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus || statusToUpdate === booking?.status}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-[0.98] transition-all font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(147,51,234,0.39)]"
                >
                  {updatingStatus ? "Syncing..." : "Update Ticket Status"}
                </button>
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
                <div className="space-y-5">
                  <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                    <button
                      onClick={() => setAllocationMode("default")}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${allocationMode === "default" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
                    >
                      PERSONNEL DEFAULT
                    </button>
                    <button
                      onClick={() => setAllocationMode("separate")}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${allocationMode === "separate" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
                    >
                      CUSTOM FLEET
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Personnel Lookup */}
                    <div className="relative">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1 flex items-center justify-between">
                        <span>Deploy Personnel</span>
                        {isReassigning && (
                          <button onClick={() => setIsReassigning(false)} className="text-rose-500 hover:text-rose-600">Cancel</button>
                        )}
                      </label>
                      <input
                        type="text"
                        placeholder="Search Name or Contact..."
                        value={searchDriver}
                        onChange={(e) => {
                          setSearchDriver(e.target.value)
                          setIsDriverDropdownOpen(true)
                          if (!e.target.value) setSelectedDriver("")
                        }}
                        onFocus={() => setIsDriverDropdownOpen(true)}
                        className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-bold text-slate-700"
                      />
                      {isDriverDropdownOpen && filteredDrivers.length > 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-60 overflow-y-auto p-2 space-y-1">
                          {filteredDrivers.map(d => (
                            <button
                              key={d.id}
                              onClick={() => selectDriver(d)}
                              className="w-full text-left p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100 group"
                            >
                              <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{d.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-[10px] font-medium text-slate-400">{d.phone}</p>
                                <span className="text-slate-300">•</span>
                                <p className="text-[10px] font-bold text-blue-500">{d.car?.model} ({d.car?.plateNumber})</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Fleet Lookup (Custom Mode) */}
                    {(allocationMode === "separate" || selectedDriver) && (
                      <div className="relative">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                          {allocationMode === "default" ? "Auto-Selected Unit" : "Deploy Custom Unit"}
                        </label>
                        <input
                          type="text"
                          placeholder="Search Model or Plate..."
                          value={searchCar}
                          onChange={(e) => {
                            setSearchCar(e.target.value)
                            setIsCarDropdownOpen(true)
                            if (!e.target.value) setSelectedCar("")
                          }}
                          onFocus={() => setIsCarDropdownOpen(true)}
                          disabled={allocationMode === "default"}
                          className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-bold text-slate-700 disabled:opacity-70 disabled:bg-slate-100"
                        />
                        {isCarDropdownOpen && filteredCars.length > 0 && allocationMode === "separate" && (
                          <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-60 overflow-y-auto p-2 space-y-1">
                            {filteredCars.map(c => (
                              <button
                                key={c.id}
                                onClick={() => selectCar(c)}
                                className="w-full text-left p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100 group"
                              >
                                <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{c.model}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.plateNumber}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={handleDispatch}
                      disabled={dispatching || !selectedDriver || !selectedCar || booking?.status === "completed" || booking?.status === "cancelled"}
                      className="w-full mt-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]"
                    >
                      {dispatching ? "Executing Deployment..." : "Authorize Dispatch"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-500 font-medium mb-5">This ticket has been firmly allocated to the following fleet operative.</p>

                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 flex items-center gap-3">
                      <button
                        onClick={() => {
                          setIsReassigning(true)
                          setSearchDriver(booking.driver?.name || "")
                          setSelectedDriver(booking.driverId)
                          setSearchCar(booking.car?.model || "")
                          setSelectedCar(booking.carId)
                        }}
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
                        <Car className="w-3.5 h-3.5" /> Assigned Unit
                      </p>
                      <p className="font-bold text-emerald-800">
                        {booking.car?.model || booking.driver?.car?.model || "Standard Fleet Unit"}
                      </p>
                      <p className="text-[11px] font-black text-emerald-600/50 mt-0.5">
                        {(booking.car?.plateNumber || booking.driver?.car?.plateNumber) || "N/A"}
                      </p>
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>

        </div>

        {/* HIDDEN INVOICE CAPTURE AREA */}
        <div className="absolute left-[-9999px] top-[-9999px]">
          <div id="invoice-capture-area" style={{ width: '800px', backgroundColor: '#fff', padding: '40px', color: '#0f172a' }}>
            <div className="flex justify-between items-start mb-8 border-b pb-8 border-slate-200">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-blue-600 mb-2">INVOICE</h1>
                <p className="text-slate-500 font-medium">Ref: #{booking?.bookingNumber}</p>
                <p className="text-slate-500 font-medium">Date: {new Date().toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">CabX Premium</h2>
                <p className="text-slate-500 font-medium">Corporate HQ</p>
                <p className="text-slate-500 font-medium">support@thecabx.com</p>
              </div>
            </div>

            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Billed To</h3>
                <p className="font-bold text-slate-900 text-lg">{booking?.guestName || booking?.user?.name || "Customer"}</p>
                <p className="text-slate-500 font-medium">{booking?.mobileNumber}</p>
                {booking?.corporateName && <p className="text-indigo-600 font-bold mt-1">{booking.corporateName}</p>}
              </div>
              <div className="text-right max-w-[300px]">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Trip Details</h3>
                <p className="text-slate-900 font-medium truncate">Pickup: {booking?.pickupAddress}</p>
                <p className="text-slate-900 font-medium truncate">Drop: {booking?.dropAddress}</p>
              </div>
            </div>

            <table className="w-full text-left mb-8 border-t border-slate-200 pt-4">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 text-xs font-black uppercase tracking-widest text-slate-400">Description</th>
                  <th className="py-3 text-right text-xs font-black uppercase tracking-widest text-slate-400">Amount</th>
                </tr>
              </thead>
              <tbody className="font-medium text-slate-700">
                <tr className="border-b border-slate-100">
                  <td className="py-4 font-bold text-slate-900">Base Fare ({booking?.carCategory?.name || 'Standard'})</td>
                  <td className="py-4 text-right font-bold">₹{booking?.fare?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                {extraKmUsageCost > 0 && (
                  <tr className="border-b border-slate-100">
                    <td className="py-4">Distance Charges ({totalKm} km @ ₹{costPerKm}/km)</td>
                    <td className="py-4 text-right">₹{extraKmUsageCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                )}
                {tollsCost > 0 && (
                  <tr className="border-b border-slate-100">
                    <td className="py-4">Tolls & Taxes</td>
                    <td className="py-4 text-right">₹{Number(tollsCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="flex justify-between py-2 border-b border-slate-200 font-bold text-slate-900 text-lg">
                  <span>Grand Total</span>
                  <span>₹{totalFare.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-2 text-emerald-600 font-medium">
                  <span>Amount Paid</span>
                  <span>- ₹{amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-3 font-black text-rose-600 text-xl border-t border-slate-900 mt-2">
                  <span>Balance Due</span>
                  <span>₹{pendingDues > 0 ? pendingDues.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "0.00"}</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-8 border-t border-slate-200 mt-16 text-slate-400 font-medium text-sm">
              Thank you for riding with CabX. This is a computer generated invoice.
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}