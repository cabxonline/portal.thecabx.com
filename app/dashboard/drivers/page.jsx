"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { 
  User, 
  Smartphone, 
  Car as CarIcon, 
  ShieldCheck, 
  Trash2, 
  Edit3, 
  Plus, 
  X, 
  ChevronRight,
  UserCheck,
  Activity,
  UserMinus
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function Drivers() {
  const [drivers, setDrivers] = useState([])
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDriver, setEditingDriver] = useState(null)
  const [operationLoading, setOperationLoading] = useState(false)

  const [form, setForm] = useState({
    name: "",
    phone: "",
    carId: "",
    status: "offline"
  })

  /* ---------------- FETCH DATA ---------------- */
  const fetchData = async () => {
    try {
      const driversRes = await api("/drivers")
      const carsRes = await api("/cars")

      const driversData = driversRes?.data ?? driversRes ?? []
      const carsData = carsRes?.data ?? carsRes ?? []

      setDrivers(Array.isArray(driversData) ? driversData : [])
      setCars(Array.isArray(carsData) ? carsData : [])
    } catch (err) {
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setOperationLoading(true)
    try {
      if (editingDriver) {
        await api(`/drivers/${editingDriver.id}`, {
          method: "PATCH",
          body: JSON.stringify(form)
        })
      } else {
        await api("/drivers", {
          method: "POST",
          body: JSON.stringify(form)
        })
      }

      setShowModal(false)
      setEditingDriver(null)
      setForm({
        name: "",
        phone: "",
        carId: "",
        status: "offline"
      })
      fetchData()
    } catch (err) {
      console.error("Submit error:", err)
    } finally {
      setOperationLoading(false)
    }
  }

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this driver from the fleet?")) return
    try {
      await api(`/drivers/${id}`, {
        method: "DELETE"
      })
      fetchData()
    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  /* ---------------- EDIT ---------------- */
  const handleEdit = (driver) => {
    setEditingDriver(driver)
    setForm({
      name: driver.name || "",
      phone: driver.phone || "",
      carId: driver.carId || "",
      status: driver.status || "offline"
    })
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M21 12a9 9 0 11-4-7.5" />
          </svg>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center">Syncing <br /> Operator Network</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col w-full bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-6 py-6 md:py-8 px-4 md:px-8">

        {/* 🌟 HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg shadow-emerald-500/20 flex items-center gap-1.5">
                <UserCheck className="w-3 h-3" /> Fleet Personnel
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-none">
              Operator Registry
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-3 max-w-md">
              Manages trained drivers, verifies identity credentials, and tracks realtime availability status.
            </p>
          </div>
          
          <button 
            onClick={() => {
              setEditingDriver(null)
              setForm({ name: "", phone: "", carId: "", status: "offline" })
              setShowModal(true)
            }}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-slate-900/10 hover:-translate-y-0.5 active:scale-95 group"
          >
            Onboard New Driver <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* 📋 OPERATORS TABLE */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight italic">Active Fleet Personnel</h3>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Operators: {drivers.length}</div>
          </div>
          
          <div className="overflow-x-auto selection:bg-blue-50">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-[#fcfdfe] border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Operator Identity</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Network</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Vehicle</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Current Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 italic font-medium">
                {drivers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-20 text-slate-300 font-bold uppercase text-xs tracking-widest">No Registered Operators Found</td>
                  </tr>
                ) : (
                  drivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm relative shrink-0">
                            <User className="w-6 h-6" />
                            <div className={cn(
                              "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm",
                              driver.status === "online" ? "bg-emerald-500" : 
                              driver.status === "busy" ? "bg-amber-500" : "bg-slate-300"
                            )} />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-base leading-none mb-1">{driver.name}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              <ShieldCheck className="w-3 h-3 text-emerald-500" /> Verified Personnel
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <a href={`tel:${driver.phone}`} className="flex items-center gap-3 group/link">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover/link:bg-blue-600 group-hover/link:text-white transition-colors">
                            <Smartphone className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-600 tabular-nums">{driver.phone}</span>
                        </a>
                      </td>
                      <td className="px-8 py-6">
                        {driver.car ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black text-slate-700 shadow-sm w-fit">
                              <CarIcon className="w-3.5 h-3.5 text-blue-600" /> {driver.car.model}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter ml-1 tabular-nums">{driver.car.plateNumber}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                          driver.status === "online" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                          driver.status === "busy" ? "bg-amber-50 text-amber-600 border-amber-200" :
                          "bg-slate-50 text-slate-500 border-slate-200"
                        )}>
                          {driver.status === "online" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                          {driver.status === "busy" && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                          {driver.status || "offline"}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(driver)}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-90"
                          >
                            <Edit3 className="w-4.5 h-4.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(driver.id)}
                            className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-all shadow-sm active:scale-90"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 🌫️ MODAL OVERLAY */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          <div className="relative bg-white w-full max-w-[480px] rounded-[2.5rem] shadow-2xl p-8 border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {editingDriver ? "Update Operator" : "Onboard Operator"}
                </h3>
                <p className="text-sm font-medium text-slate-500 mt-1">Personnel identity and fleet assignment</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* NAME */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Operator Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    required
                    placeholder="Enter full name"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:bg-white focus:border-blue-500 font-bold text-slate-700 transition-all"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              {/* PHONE */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Communication Network (Phone)</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    required
                    placeholder="Enter phone number"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:bg-white focus:border-blue-500 font-bold text-slate-700 transition-all"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* CAR */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Assigned Vehicle</label>
                  <select
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:bg-white focus:border-blue-500 font-bold text-slate-700 transition-all appearance-none"
                    value={form.carId}
                    onChange={(e) => setForm({ ...form, carId: e.target.value })}
                  >
                    <option value="">No Vehicle</option>
                    {cars.map((car) => (
                      <option key={car.id} value={car.id}>
                        {car.model} ({car.plateNumber})
                      </option>
                    ))}
                  </select>
                </div>

                {/* STATUS */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Shift Status</label>
                  <select
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:bg-white focus:border-blue-500 font-bold text-slate-700 transition-all appearance-none"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="offline">Offline / Off-Shift</option>
                    <option value="online">Online / Active</option>
                    <option value="busy">Busy / On-Mission</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 px-6 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                >
                  Discard
                </button>
                <button
                  disabled={operationLoading}
                  type="submit"
                  className="flex-[2] py-4 px-6 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {operationLoading ? "Processing..." : editingDriver ? "Deploy Changes" : "Onboard Operator"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}