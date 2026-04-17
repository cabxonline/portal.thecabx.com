"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { 
  ChevronLeft, 
  User, 
  CarFront, 
  MapPin, 
  CreditCard, 
  Send, 
  Phone, 
  Mail, 
  Building2, 
  Clock, 
  Users
} from "lucide-react"

export default function CreateBooking() {
  const router = useRouter()

  const [users, setUsers] = useState([])
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    userId: "",
    carCategoryId: "",
    guestName: "",
    gender: "Male",
    mobileNumber: "",
    corporateName: "",
    pickupAddress: "",
    dropAddress: "",
    fare: "",
    pickupTime: ""
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
      <div className="w-full max-w-5xl mx-auto py-6 md:py-8 px-4 md:px-8">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard/bookings')}
              type="button"
              className="p-2.5 bg-white border border-slate-200 rounded-[1rem] hover:bg-slate-50 text-slate-500 transition-all shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight italic">Manual Dispatch</h1>
              <p className="text-slate-500 font-medium text-sm mt-1">Initialize a new network ticket with custom passenger metadata.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Passenger & Route Intelligence */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* LEAD PASSENGER DETAILS */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                     <User className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight italic">Lead Passenger Details</h2>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Account Master Selection *</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-bold text-slate-700 transition-all"
                      value={form.userId}
                      onChange={(e) => setForm({ ...form, userId: e.target.value })}
                      required
                    >
                      <option value="" disabled>-- Select Profile --</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name (Registry)</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-bold"
                      value={form.guestName}
                      onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Gender Identification</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-bold"
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number *</label>
                    <div className="relative">
                       <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input
                        type="text"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-bold"
                        value={form.mobileNumber}
                        onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                        placeholder="+91 XXXXX XXXXX"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Corporate Ref / Company</label>
                    <div className="relative">
                       <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input
                        type="text"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-bold"
                        value={form.corporateName}
                        onChange={(e) => setForm({ ...form, corporateName: e.target.value })}
                        placeholder="Company Name (Optional)"
                      />
                    </div>
                  </div>
               </div>
            </div>

            {/* ROUTE CONFIGURATION */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                     <MapPin className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight italic">Travel Configuration</h2>
               </div>

               <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Exact Pickup Address *</label>
                    <textarea
                      rows="2"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-bold"
                      value={form.pickupAddress}
                      onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                      placeholder="e.g. T3 Arrival, Gate 2"
                      required
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 text-emerald-600">Exact Drop-off Address *</label>
                    <textarea
                      rows="2"
                      className="w-full px-4 py-3 bg-emerald-50/30 border border-emerald-100 rounded-xl text-sm outline-none focus:border-emerald-500 font-bold"
                      value={form.dropAddress}
                      onChange={(e) => setForm({ ...form, dropAddress: e.target.value })}
                      placeholder="e.g. Taj Hotel, Mumbai"
                      required
                    ></textarea>
                  </div>
               </div>
            </div>

          </div>

          {/* RIGHT: Logistics & Submission */}
          <div className="space-y-6">
            
            {/* LOGISTICAL SETTINGS */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 italic">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 italic">
                     <Clock className="w-5 h-5 italic" />
                  </div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Timeline</h2>
               </div>

               <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Preferred Pickup Time</label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-bold text-slate-700 appearance-none cursor-pointer"
                        value={form.pickupTime}
                        onChange={(e) => setForm({ ...form, pickupTime: e.target.value })}
                        required
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
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Vehicle Classification *</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-bold text-slate-700"
                      value={form.carCategoryId}
                      onChange={(e) => setForm({ ...form, carCategoryId: e.target.value })}
                      required
                    >
                      <option value="" disabled>-- Select Class --</option>
                      {cars.map(car => (
                        <option key={car.id} value={car.id}>{car.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Manual Fare Override (₹)</label>
                    <div className="relative">
                       <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input
                        type="number"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 font-black text-emerald-600 italic"
                        value={form.fare}
                        onChange={(e) => setForm({ ...form, fare: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
               </div>
            </div>

            {/* ACTION BUTTON */}
            <button
              disabled={loading}
              className="w-full py-5 rounded-[2rem] bg-slate-900 hover:bg-black text-white font-black text-lg shadow-2xl transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3 italic"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                   <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M21 12a9 9 0 11-4-7.5" /></svg>
                   <span>Initializing...</span>
                </div>
              ) : (
                <>
                  <Send className="w-5 h-5 italic" /> Finalize Ticket
                </>
              )}
            </button>

            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center px-4">
              Authorized personnel only. Data verified upon submission to network core.
            </p>

          </div>

        </form>

      </div>
    </div>
  )
}