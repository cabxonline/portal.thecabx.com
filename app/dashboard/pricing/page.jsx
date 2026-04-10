"use client"

import { useEffect, useState, useRef } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import {
  Plus,
  Trash2,
  Pencil,
  CalendarDays,
  CarFront,
  Upload,
  Download,
  FileSpreadsheet
} from "lucide-react"

export default function ManualPricingManager() {
  const [pricings, setPricings] = useState([])
  const [carCategories, setCarCategories] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [operationLoading, setOperationLoading] = useState(false)
  const [bulkUploading, setBulkUploading] = useState(false)
  
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    carId: "",
    from: "",
    to: "",
    date: "",
    price: "",
    tripType: "one-way"
  })

  const loadData = async () => {
    try {
      const pricingData = await api("/manual-pricing")
      setPricings(Array.isArray(pricingData) ? pricingData : (pricingData?.data || []))

      const data = await api("/car-categories")
      setCarCategories(Array.isArray(data) ? data : (data?.data || []))
    } catch (err) {
      toast.error("Failed to sync structural dependencies.")
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
      setOperationLoading(true)
      const payload = { ...form }
      if (editingId) {
        await api(`/manual-pricing/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        })
        toast.success("Pricing route updated!")
      } else {
        await api("/manual-pricing", {
          method: "POST",
          body: JSON.stringify(payload)
        })
        toast.success("Pricing rule activated globally!")
      }
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      toast.error(err.message || "Failed to commit pricing rule.")
    } finally {
      setOperationLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return
    try {
      await api(`/manual-pricing/${id}`, { method: "DELETE" })
      toast.success("Mapping removed.")
      loadData()
    } catch (err) {
      toast.error("Wipe failed.")
    }
  }

  // --- CSV OPERATIONS ---

  const downloadSampleCSV = () => {
    const headers = ["Date (YYYY-MM-DD)", "From", "To", "Vehicle Category", "Price", "TripType (one-way/roundtrip)"]
    const sampleRows = [
      ["2024-05-01", "Delhi", "Chandigarh", "Sedan", "2500", "one-way"],
      ["2024-05-01", "Delhi", "Agra", "SUV", "4500", "roundtrip"]
    ]
    const content = [headers.join(","), ...sampleRows.map(r => r.join(","))].join("\n")
    const blob = new Blob([content], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'manual_pricing_sample.csv'
    a.click()
  }

  const handleExportCSV = () => {
    if (pricings.length === 0) return toast.error("No data to export.")
    const headers = ["Date", "From", "To", "Category", "Price", "TripType"]
    const rows = pricings.map(p => [
      new Date(p.date).toISOString().split('T')[0],
      p.from,
      p.to,
      p.car?.name || "Unknown",
      p.price,
      p.tripType
    ])
    const content = [headers.join(","), ...rows.map(r => `"${r.join('","')}"`)].join("\n")
    const blob = new Blob([content], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = window.URL.createObjectURL(blob)
    a.download = `pricing_export_${new Date().getTime()}.csv`
    a.click()
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setBulkUploading(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const text = event.target.result
        const lines = text.split('\n').filter(l => l.trim().length > 0)
        const dataLines = lines.slice(1) // Skip headers
        
        const payload = dataLines.map(line => {
          const cols = line.split(',').map(c => c.replace(/["']/g, '').trim())
          return {
            date: cols[0],
            from: cols[1],
            to: cols[2],
            carName: cols[3],
            price: cols[4],
            tripType: cols[5] || "one-way"
          }
        })
        
        const res = await api('/manual-pricing/bulk', {
          method: 'POST',
          body: JSON.stringify({ records: payload })
        })
        
        toast.success(res.message || "Bulk import successful!")
        loadData()
      } catch (err) {
        toast.error("Parsing error. Check CSV format.")
      } finally {
        setBulkUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    }
    reader.readAsText(file)
  }

  const openNewModal = () => {
    setForm({ carId: carCategories[0]?.id || "", from: "", to: "", date: "", price: "", tripType: "one-way" })
    setEditingId(null)
    setIsModalOpen(true)
  }

  const openEditModal = (p) => {
    setForm({
      carId: p.carId,
      from: p.from,
      to: p.to,
      date: p.date ? new Date(p.date).toISOString().split('T')[0] : "",
      price: p.price,
      tripType: p.tripType || "one-way"
    })
    setEditingId(p.id)
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50">
        <svg className="animate-spin w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M21 12a9 9 0 11-4-7.5" />
        </svg>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col w-full bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-7xl mx-auto py-6 md:py-8 px-4 md:px-8">

        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manual Pricing Matrix</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Bulk manage asset class rates and market thresholds.</p>
          </div>
          
          <div className="flex items-center gap-3">
             <button onClick={downloadSampleCSV} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 font-bold text-xs" title="Download Template">
               <FileSpreadsheet className="w-4 h-4" />
               Sample
             </button>

             <button onClick={handleExportCSV} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 font-bold text-xs">
               <Download className="w-4 h-4" />
               Export
             </button>

             <div>
               <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
               <button onClick={() => fileInputRef.current.click()} disabled={bulkUploading} className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-all shadow-sm flex items-center gap-2 font-bold text-xs">
                 <Upload className="w-4 h-4" />
                 {bulkUploading ? "Importing..." : "Bulk Import"}
               </button>
             </div>

             <button onClick={openNewModal} className="py-2.5 px-5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-sm transition-all shadow-md flex items-center gap-2">
               <Plus className="w-4 h-4" />
               New Rule
             </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Route Geography</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Asset Class</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Rate</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pricings.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 group transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <CalendarDays className="w-4 h-4 text-slate-400" />
                         <span className="font-bold text-slate-900">
                           {new Date(p.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                         </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter ml-6">{p.tripType}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-600">
                       {p.from} <span className="text-slate-300 mx-1">→</span> {p.to}
                    </td>
                    <td className="px-6 py-4">
                       <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase border border-emerald-100 flex items-center justify-center w-fit gap-2">
                         <CarFront className="w-3 h-3" />
                         {p.car?.name}
                       </span>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900 text-lg">₹{p.price}</td>
                    <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                       <div className="flex justify-end gap-1">
                         <button onClick={() => openEditModal(p)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                         <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
               <h3 className="text-xl font-black text-slate-900 mb-6">{editingId ? "Edit Pricing Rule" : "New Pricing Rule"}</h3>
               <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Asset Category</label>
                   <select required value={form.carId} onChange={(e) => setForm({...form, carId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-700 appearance-none cursor-pointer">
                      <option value="" disabled>Select Vehicle</option>
                      {carCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <input required value={form.from} onChange={(e) => setForm({...form, from: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold" placeholder="Origin" />
                   <input required value={form.to} onChange={(e) => setForm({...form, to: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold" placeholder="Destination" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <input required type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold" />
                   <select value={form.tripType} onChange={(e) => setForm({...form, tripType: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold appearance-none cursor-pointer">
                     <option value="one-way">One Way</option>
                     <option value="roundtrip">Round Trip</option>
                   </select>
                 </div>
                 <input required type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl outline-none focus:border-emerald-500 font-black text-emerald-900" placeholder="Price (INR)" />
                 <div className="flex gap-3 pt-4">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-400 hover:bg-slate-50 transition-colors">Cancel</button>
                   <button type="submit" disabled={operationLoading} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-md transition-colors disabled:opacity-50">
                     {operationLoading ? "Saving..." : "Save Rule"}
                   </button>
                 </div>
               </form>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}