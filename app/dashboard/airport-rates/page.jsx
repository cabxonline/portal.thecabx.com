"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import {
  Plus,
  Trash2,
  Plane,
  Car
} from "lucide-react"
import CityAutocomplete from "@/components/CityAutocomplete"

export default function AirportRatesManager() {
  const [rates, setRates] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    city: "",
    carCategoryId: "",
    price: "",
    maxKm: "10",
    isGlobal: false
  })

  const loadData = async () => {
    try {
      const [ratesData, catData] = await Promise.all([
        api("/airport-rates"),
        api("/car-categories")
      ])
      setRates(ratesData)
      setCategories(catData)
    } catch (err) {
      toast.error("Failed to load airport rates")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api("/airport-rates", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          city: form.isGlobal ? "Global" : form.city
        })
      })
      toast.success("Rate updated successfully")
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this rate?")) return
    try {
      await api(`/airport-rates/${id}`, { method: "DELETE" })
      toast.success("Rate deleted")
      loadData()
    } catch (err) {
      toast.error("Failed to delete rate")
    }
  }

  const openNewModal = () => {
    setForm({ city: "", carCategoryId: "", price: "", maxKm: "10", isGlobal: false })
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col w-full bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-7xl mx-auto py-6 md:py-8 px-4 md:px-8">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Plane className="w-8 h-8 text-blue-600" /> Airport Fixed Rates
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Manage fixed pricing for airport transfers based on city and radius ranges.</p>
          </div>

          <button
            onClick={openNewModal}
            className="py-2.5 px-5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Fixed Rate
          </button>
        </div>

        <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Target Area</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Range (KM)</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Car Category</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Fixed Price</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rates.map(rate => (
                  <tr key={rate.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      {rate.city === "Global" ? (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-tighter border border-blue-100">Global Coverage</span>
                      ) : (
                        <p className="font-bold text-slate-900">{rate.city}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-600">Up to <span className="font-black text-slate-900">{rate.maxKm} KM</span></p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        <Car className="w-3 h-3" /> {rate.carCategory.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-900 text-lg">₹{rate.price}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(rate.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {rates.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">
                      No fixed rates defined yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6 font-sans tracking-tight">Setup Airport Fixed Rate</h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                   <div>
                      <p className="text-sm font-black text-slate-700">Apply Globally?</p>
                      <p className="text-[10px] text-slate-500 font-medium">Ignore specific city and apply as default</p>
                   </div>
                   <input 
                     type="checkbox" 
                     checked={form.isGlobal}
                     onChange={(e) => setForm({ ...form, isGlobal: e.target.checked })}
                     className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                   />
                </div>

                {!form.isGlobal && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Select City</label>
                    <CityAutocomplete
                      placeholder="Search City (e.g. Lucknow)"
                      value={form.city}
                      onSelect={(city) => setForm({ ...form, city: city.name })}
                      className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 font-bold text-slate-700 w-full"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Range (Max KM)</label>
                    <select
                      required
                      value={form.maxKm}
                      onChange={(e) => setForm({ ...form, maxKm: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-bold text-slate-700 appearance-none"
                    >
                      {[10, 20, 30, 40, 50, 60, 100, 200, 500].map(km => (
                        <option key={km} value={km}>{km} KM</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Vehicle Category</label>
                    <select
                      required
                      value={form.carCategoryId}
                      onChange={(e) => setForm({ ...form, carCategoryId: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-bold text-slate-700 appearance-none"
                    >
                      <option value="">Select</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Fixed Price (INR)</label>
                  <input
                    required
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-black text-slate-900"
                    placeholder="e.g. 899"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-blue-600 rounded-xl font-bold text-sm text-white hover:bg-blue-700 shadow-md">Save Rate</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
