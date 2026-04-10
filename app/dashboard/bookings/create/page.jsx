"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ChevronLeft, User, CarFront, MapPin, CreditCard, Send } from "lucide-react"

export default function CreateBooking() {
  const router = useRouter()

  const [users, setUsers] = useState([])
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    userId: "",
    carCategoryId: "",
    pickupAddress: "",
    dropAddress: "",
    fare: ""
  })

  useEffect(() => {
    async function loadData() {
      try {
        const usersRes = await api("/users")
        const carsRes = await api("/car-categories")
        setUsers(usersRes.data || usersRes)
        setCars(carsRes.data || carsRes)
      } catch (err) {
        console.error(err)
        toast.error("Failed to load prerequisite data")
      }
    }
    loadData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await api("/bookings", {
        method: "POST",
        body: JSON.stringify(form)
      })
      toast.success("Manual booking created successfully!")
      router.push("/dashboard/bookings")
    } catch (err) {
      console.error(err)
      toast.error("Failed to create booking")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col w-full bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-4xl mx-auto py-6 md:py-8 px-4 md:px-8">

        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard/bookings')}
              type="button"
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Internal Booking</h1>
              <p className="text-slate-500 font-medium text-sm mt-0.5">Manually initialize a ticket on behalf of a customer.</p>
            </div>
          </div>
        </div>

        {/* Form Engine */}
        <div className="bg-white rounded-[1.5rem] p-6 md:p-8 shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Customer Match */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 ml-1">
                  <User className="w-3.5 h-3.5" /> Customer Account
                </label>
                <div className="relative">
                  <select
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-700 appearance-none"
                    value={form.userId}
                    onChange={(e) => setForm({ ...form, userId: e.target.value })}
                    required
                  >
                    <option value="" disabled>-- Select a registered passenger --</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              {/* Category Match */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 ml-1">
                  <CarFront className="w-3.5 h-3.5" /> Vehicle Class
                </label>
                <div className="relative">
                  <select
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-700 appearance-none"
                    value={form.carCategoryId}
                    onChange={(e) => setForm({ ...form, carCategoryId: e.target.value })}
                    required
                  >
                    <option value="" disabled>-- Select fleet class --</option>
                    {cars.map(car => (
                      <option key={car.id} value={car.id}>{car.name} (Capacity: {car.capacity})</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

            </div>

            {/* Travel Route */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-5">
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 ml-1">
                  <MapPin className="w-3.5 h-3.5" /> Pickup Address
                </label>
                <input
                  type="text"
                  placeholder="e.g., Terminal 2, Airport"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium placeholder-slate-300"
                  value={form.pickupAddress}
                  onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 ml-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> Destination Address
                </label>
                <input
                  type="text"
                  placeholder="e.g., 123 Business Avenue"
                  className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium placeholder-slate-300"
                  value={form.dropAddress}
                  onChange={(e) => setForm({ ...form, dropAddress: e.target.value })}
                  required
                />
              </div>

            </div>

            {/* Pricing Override */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 ml-1">
                <CreditCard className="w-3.5 h-3.5" /> Manual Fare Quote (₹)
              </label>
              <input
                type="number"
                placeholder="Optional preset fare"
                className="w-full max-w-[200px] px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-bold text-slate-900"
                value={form.fare}
                onChange={(e) => setForm({ ...form, fare: e.target.value })}
              />
              <p className="text-xs text-slate-400 mt-1.5 ml-1 font-medium">Leave blank for automatic algorithm calculation later.</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                disabled={loading}
                className="w-full sm:w-auto min-w-[200px] py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]"
              >
                {loading ? "Generating..." : <><Send className="w-4 h-4" /> Finalize Booking</>}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  )
}