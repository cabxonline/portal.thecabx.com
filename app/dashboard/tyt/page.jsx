"use client"

import { useEffect, useState, useRef } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import {
  Upload,
  Download,
  Plus,
  TrendingUp,
  TrendingDown,
  Trash2,
  Edit,
  Pencil,
  Search
} from "lucide-react"

export default function TYTManager() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    from: "",
    to: "",
    car: "",
    price: "",
    trend: "UP"
  })

  const [bulkUploading, setBulkUploading] = useState(false)
  const fileInputRef = useRef(null)

  const loadData = async () => {
    try {
      const res = await api("/tyt")
      const safeData = Array.isArray(res) ? res : (res?.data || [])
      setStocks(safeData)
    } catch (err) {
      toast.error("Failed to load TYT market data")
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
      if (editingId) {
        await api(`/tyt/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(form)
        })
        toast.success("Pricing route updated!")
      } else {
        await api("/tyt", {
          method: "POST",
          body: JSON.stringify(form)
        })
        toast.success("New pricing route activated!")
      }
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      toast.error(err.message || "Failed to process form")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to deactivate this line item?")) return
    try {
      await api(`/tyt/${id}`, { method: "DELETE" })
      toast.success("Item securely deactivated.")
      loadData()
    } catch (err) {
      toast.error("Deletion failed.")
    }
  }

  const handleToggleTrend = async (id) => {
    try {
      await api(`/tyt/${id}/toggle-trend`, { method: "PATCH" })
      toast.success("Trend vector toggled.")
      loadData()
    } catch (err) {
      toast.error("Failed to sequence trend.")
    }
  }

  // EXPORT ENGINE
  const handleExportCSV = () => {
    if (stocks.length === 0) return toast.error("No data available to export.")
    
    const headers = ["From", "To", "Car Category", "Price (INR)", "Trend Pattern"]
    const csvContent = [
      headers.join(","),
      ...stocks.map(s => `"${s.from}","${s.to}","${s.car}",${s.price},${s.trend}`)
    ].join("\n")
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `cabx_tyt_export_${new Date().getTime()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Export completed securely!")
  }

  // BULK INJECTION BROWSER SCRIPT
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        setBulkUploading(true)
        const text = event.target.result
        const lines = text.split('\n')
        
        // Remove headers
        const dataLines = lines.slice(1).filter(l => l.trim().length > 0)
        
        const payload = dataLines.map(line => {
          // Simplistic CSV parsing (assuming no commas in the string fields)
          const cols = line.split(',')
          return {
             from: cols[0]?.replace(/["']/g, '').trim(),
             to: cols[1]?.replace(/["']/g, '').trim(),
             car: cols[2]?.replace(/["']/g, '').trim(),
             price: cols[3]?.replace(/["']/g, '').trim(),
             trend: cols[4]?.replace(/["']/g, '').trim() || 'UP'
          }
        })
        
        const res = await api('/tyt/bulk', {
          method: 'POST',
          body: JSON.stringify({ records: payload })
        })
        
        toast.success(res.message || "Bulk injection processed!")
        loadData()
      } catch (err) {
        toast.error("Fatal parsing error: Ensure CSV format matches standard.")
        console.error(err)
      } finally {
        setBulkUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    }
    
    reader.readAsText(file)
  }

  const openNewModal = () => {
    setForm({ from: "", to: "", car: "", price: "", trend: "UP" })
    setEditingId(null)
    setIsModalOpen(true)
  }

  const openEditModal = (stock) => {
    setForm({
      from: stock.from,
      to: stock.to,
      car: stock.car,
      price: stock.price,
      trend: stock.trend
    })
    setEditingId(stock.id)
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

        {/* Global Operations Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Trending Fares</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Manage global manual pricing routing and market trends natively.</p>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
               onClick={handleExportCSV}
               className="py-2.5 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-all focus:ring-4 focus:ring-slate-100 flex items-center justify-center gap-2 shadow-sm"
             >
               <Download className="w-4 h-4" />
               Export DB
             </button>
             
             <div>
               <input 
                 type="file" 
                 accept=".csv" 
                 ref={fileInputRef} 
                 onChange={handleFileUpload} 
                 className="hidden" 
               />
               <button 
                 onClick={() => fileInputRef.current.click()}
                 disabled={bulkUploading}
                 className="py-2.5 px-4 rounded-xl bg-white border border-slate-200 text-blue-700 hover:bg-blue-50 font-bold text-sm transition-all focus:ring-4 focus:ring-blue-100 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
               >
                 <Upload className="w-4 h-4" />
                 {bulkUploading ? "Streaming Payload..." : "Bulk Push"}
               </button>
             </div>

             <button 
               onClick={openNewModal}
               className="py-2.5 px-5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold text-sm transition-all active:scale-[0.98] shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] flex items-center justify-center gap-2"
             >
               <Plus className="w-4 h-4" />
               Insert Route
             </button>
          </div>
        </div>

        {/* Dynamic Data Grid */}
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Route Architecture</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Class</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Market Price</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Trend Tracker</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stocks.map(stock => (
                  <tr key={stock.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm"></div>
                         <p className="font-bold text-slate-900">{stock.from}</p>
                         <span className="text-slate-300 mx-2 text-xs">→</span>
                         <p className="font-bold text-slate-900">{stock.to}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                          {stock.car}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <p className="font-black text-slate-900">₹{stock.price}</p>
                    </td>
                    <td className="px-6 py-4">
                       <button onClick={() => handleToggleTrend(stock.id)} className="focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md transition-all">
                         {stock.trend === "UP" ? (
                           <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-black uppercase tracking-widest">
                             <TrendingUp className="w-3.5 h-3.5" /> High Vector
                           </span>
                         ) : (
                           <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black uppercase tracking-widest">
                             <TrendingDown className="w-3.5 h-3.5" /> Low Vector
                           </span>
                         )}
                       </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => openEditModal(stock)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                           <Pencil className="w-4 h-4" />
                         </button>
                         <button onClick={() => handleDelete(stock.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}

                {stocks.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium text-sm">
                      No marketplace routes found. Use Bulk Push or Insert Route to populate system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Layer */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100">
               <h3 className="text-xl font-black text-slate-900 mb-6">{editingId ? "Modify Route Rules" : "Initialize New Pricing"}</h3>
               
               <form onSubmit={handleSubmit} className="space-y-4">
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Origin Node</label>
                     <input required value={form.from} onChange={(e) => setForm({...form, from: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-bold text-slate-700" placeholder="Source City" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Terminal Node</label>
                     <input required value={form.to} onChange={(e) => setForm({...form, to: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-bold text-slate-700" placeholder="Destination City" />
                   </div>
                 </div>

                 <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Car Category Payload</label>
                   <input required value={form.car} onChange={(e) => setForm({...form, car: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-bold text-slate-700" placeholder="e.g. Sedan, SUV, Premium" />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Market Fare (INR)</label>
                     <input required type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 font-black text-slate-900" placeholder="0.00" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Initial Vector</label>
                     <select value={form.trend} onChange={(e) => setForm({...form, trend: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-bold text-slate-700 appearance-none">
                       <option value="UP">High Vector (UP)</option>
                       <option value="DOWN">Low Vector (DOWN)</option>
                     </select>
                   </div>
                 </div>

                 <div className="flex gap-3 pt-4">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                   <button type="submit" className="flex-1 py-3 bg-blue-600 rounded-xl font-bold text-sm text-white hover:bg-blue-700">Push Configuration</button>
                 </div>

               </form>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
