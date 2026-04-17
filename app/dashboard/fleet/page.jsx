"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { 
  Car as CarIcon, 
  Hash, 
  Shield, 
  User, 
  Trash2, 
  Edit3, 
  Plus, 
  X, 
  ChevronRight,
  Info,
  Settings,
  ShieldCheck,
  Zap,
  Box
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function Fleet() {
  const [cars, setCars] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCar, setEditingCar] = useState(null)
  const [operationLoading, setOperationLoading] = useState(false)

  const [form, setForm] = useState({
    model: "",
    plateNumber: "",
    categoryId: ""
  })

  /* ---------------- FETCH DATA ---------------- */
  const fetchData = async () => {
    try {
      const carsData = await api("/cars")
      const categoriesData = await api("/car-categories")

      setCars(carsData.data || carsData || [])
      setCategories(categoriesData || [])
    } catch (err) {
      console.error("Fleet fetch error:", err)
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
      if (editingCar) {
        await api(`/cars/${editingCar.id}`, {
          method: "PATCH",
          body: JSON.stringify(form)
        })
      } else {
        await api("/cars", {
          method: "POST",
          body: JSON.stringify(form)
        })
      }

      setShowModal(false)
      setEditingCar(null)
      setForm({ model: "", plateNumber: "", categoryId: "" })
      fetchData()
    } catch (err) {
      console.error("Submit error:", err)
    } finally {
      setOperationLoading(false)
    }
  }

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to decommission this vehicle from the fleet?")) return
    try {
      await api(`/cars/${id}`, {
        method: "DELETE"
      })
      fetchData()
    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M21 12a9 9 0 11-4-7.5" />
          </svg>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center">Auditing <br /> Vehicle Assets</p>
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
              <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg shadow-blue-500/20 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" /> Fleet Management
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-none">
              Vehicle Registry
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-3 max-w-md">
              Manage physical assets, license credentials, and category assignments for the global transportation network.
            </p>
          </div>
          
          <button 
            onClick={() => {
              setEditingCar(null)
              setForm({ model: "", plateNumber: "", categoryId: "" })
              setShowModal(true)
            }}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-slate-900/10 hover:-translate-y-0.5 active:scale-95 group"
          >
            Onboard New Vehicle <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* 📋 VEHICLE TABLE */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight italic">Active Asset List</h3>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory Count: {cars.length}</div>
          </div>
          
          <div className="overflow-x-auto selection:bg-blue-50">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-[#fcfdfe] border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Vehicle Model</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">License Plate</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Classification</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Active Crew</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 italic font-medium">
                {cars.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-20 text-slate-300 font-bold uppercase text-xs tracking-widest">No Registered Vehicles Found</td>
                  </tr>
                ) : (
                  cars.map((car) => (
                    <tr key={car.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                            <CarIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-base leading-none mb-1">{car.model}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              Asset ID: #{car.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-black font-mono tracking-wider text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-sm shadow-sm inline-block">
                          {car.plateNumber}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border shadow-sm",
                          "bg-indigo-50 text-indigo-600 border-indigo-100"
                        )}>
                          <Box className="w-3.5 h-3.5" /> {car.category?.name || "Unclassified"}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        {car.driver ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                              <User className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-slate-700">{car.driver.name}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">No Pilot Assigned</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => {
                              setEditingCar(car)
                              setForm({
                                model: car.model,
                                plateNumber: car.plateNumber,
                                categoryId: car.categoryId
                              })
                              setShowModal(true)
                            }}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-90"
                          >
                            <Edit3 className="w-4.5 h-4.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(car.id)}
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
                  {editingCar ? "Update Vehicle" : "Add New Vehicle"}
                </h3>
                <p className="text-sm font-medium text-slate-500 mt-1">Configure asset identification and class</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* MODEL */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Vehicle Model & Make</label>
                <div className="relative">
                  <CarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    required
                    placeholder="e.g. Toyota Innova Hycross"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:bg-white focus:border-blue-500 font-bold text-slate-700 transition-all"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                  />
                </div>
              </div>

              {/* PLATE */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">License Plate Number</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    required
                    placeholder="e.g. UP 32 XX 1234"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:bg-white focus:border-blue-500 font-bold text-slate-700 transition-all uppercase"
                    value={form.plateNumber}
                    onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
                  />
                </div>
              </div>

              {/* CATEGORY */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Fleet Classification</label>
                <div className="relative">
                  <Settings className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:bg-white focus:border-blue-500 font-bold text-slate-700 transition-all appearance-none"
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  >
                    <option value="">Select Asset Class</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
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
                  {operationLoading ? "Processing..." : editingCar ? "Deploy Updates" : "Register Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}