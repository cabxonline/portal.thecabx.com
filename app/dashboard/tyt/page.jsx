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
import CityAutocomplete from "@/components/CityAutocomplete"

export default function TYTManager() {
  const [stocks, setStocks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    from: "",
    car: "",
    price: "",
    trend: "UP"
  })

  const [bulkUploading, setBulkUploading] = useState(false)
  const fileInputRef = useRef(null)

  // TYT Factory States
  const [activeMainTab, setActiveMainTab] = useState("stocks") // "stocks" | "factory"
  const [activeSubTab, setActiveSubTab] = useState("roundtrip") // "roundtrip" | "local" | "airport"
  const [selectedCity, setSelectedCity] = useState("All")
  const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
  const [factoryConfig, setFactoryConfig] = useState({
    roundtrip: DAYS.reduce((acc, day) => ({ ...acc, [day]: { trend: 'UP', percentage: 0 } }), {}),
    local:     DAYS.reduce((acc, day) => ({ ...acc, [day]: { trend: 'UP', percentage: 0 } }), {})
  })
  const [allFactoryTrends, setAllFactoryTrends] = useState([])
  const [savingFactory, setSavingFactory] = useState(false)

  const loadData = async () => {
    try {
      const res = await api("/tyt")
      const safeData = Array.isArray(res) ? res : (res?.data || [])
      setStocks(safeData)

      // Sync car categories for the selector
      const categoriesData = await api("/car-categories")
      setCategories(categoriesData)

      // Load Factory Trends
      const factoryRes = await api("/tyt/factory")
      if (Array.isArray(factoryRes)) {
        setAllFactoryTrends(factoryRes)
      }
    } catch (err) {
      toast.error("Network sync failed: could not fetch metadata")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Sync factoryConfig when city or subTab changes
  useEffect(() => {
    const currentTrend = allFactoryTrends.find(f => f.tripType === activeSubTab && f.city === selectedCity)
    if (currentTrend && currentTrend.config) {
      setFactoryConfig(prev => ({
        ...prev,
        [activeSubTab]: currentTrend.config
      }))
    } else {
      // Reset to default if no specific config found
      setFactoryConfig(prev => ({
        ...prev,
        [activeSubTab]: DAYS.reduce((acc, day) => ({ ...acc, [day]: { trend: 'UP', percentage: 0 } }), {})
      }))
    }
  }, [selectedCity, activeSubTab, allFactoryTrends])

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

    const headers = ["From", "Car Category", "Price (INR)", "Trend Pattern"]
    const csvContent = [
      headers.join(","),
      ...stocks.map(s => `"${s.from}","${s.car}",${s.price},${s.trend}`)
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
            car: cols[1]?.replace(/["']/g, '').trim(),
            price: cols[2]?.replace(/["']/g, '').trim(),
            trend: cols[3]?.replace(/["']/g, '').trim() || 'UP'
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

  // TYT FACTORY HANDLERS
  const handleFactoryChange = (tripType, day, field, value) => {
    setFactoryConfig(prev => ({
      ...prev,
      [tripType]: {
        ...prev[tripType],
        [day]: {
          ...prev[tripType][day],
          [field]: value
        }
      }
    }))
  }

  const handleSaveFactory = async () => {
    if (activeSubTab === "airport") return;
    setSavingFactory(true)
    try {
      await api("/tyt/factory", {
        method: "POST",
        body: JSON.stringify({
          tripType: activeSubTab,
          city: selectedCity,
          config: factoryConfig[activeSubTab]
        })
      })
      toast.success(`${activeSubTab.toUpperCase()} trends saved for ${selectedCity}!`)
      loadData()
    } catch (err) {
      toast.error("Failed to save factory trends")
    } finally {
      setSavingFactory(false)
    }
  }

  const openNewModal = () => {
    setForm({ from: "", car: "", price: "", trend: "UP" })
    setEditingId(null)
    setIsModalOpen(true)
  }

  const openEditModal = (stock) => {
    setForm({
      from: stock.from,
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

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-200">
           <button 
             onClick={() => setActiveMainTab("stocks")}
             className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeMainTab === "stocks" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
           >
             Stock Routes
           </button>
           <button 
             onClick={() => setActiveMainTab("factory")}
             className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeMainTab === "factory" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
           >
             TYT Factory
           </button>
        </div>

        {activeMainTab === "stocks" ? (
          <>
            {/* Dynamic Data Grid */}
            <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Route Architecture</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Price Per Km</th>
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
                      <div className="flex justify-end gap-2">
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
        </>
        ) : (
          <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-200 overflow-hidden p-6">
             {/* Sub Tabs */}
             <div className="flex gap-3 mb-6 p-1 bg-slate-50 rounded-xl w-fit">
                {["roundtrip", "local", "airport"].map(t => (
                   <button 
                     key={t}
                     onClick={() => setActiveSubTab(t)}
                     className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${activeSubTab === t ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                   >
                     {t}
                   </button>
                ))}
             </div>

             {/* City Selection for Factory */}
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 p-6 bg-blue-50/50 border border-blue-100 rounded-[1.5rem]">
               <div>
                 <h4 className="text-lg font-black text-slate-800">Geographic Targeting</h4>
                 <p className="text-xs font-medium text-slate-500">Apply these trends to a specific city or use 'All' as a global default.</p>
               </div>
               <div className="w-full md:w-64 bg-white rounded-xl shadow-sm border border-slate-200">
                  <CityAutocomplete 
                    value={selectedCity === "All" ? "" : selectedCity}
                    onSelect={(city) => setSelectedCity(city.name)}
                    placeholder="Global Default (All)"
                    className="px-4 py-3 border-0 bg-transparent text-sm font-bold w-full"
                  />
                  {selectedCity !== "All" && (
                    <button onClick={() => setSelectedCity("All")} className="px-4 pb-2 text-[10px] font-black text-rose-500 hover:underline uppercase tracking-tight">Clear to Global</button>
                  )}
               </div>
             </div>
             
             {activeSubTab === "airport" ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                   <TrendingUp className="w-12 h-12 mb-4 opacity-50" />
                   <h3 className="text-xl font-black text-slate-700">Airport Trends</h3>
                   <p className="mt-2 font-medium">Coming soon in a future update.</p>
                </div>
             ) : (
                <div className="space-y-6 max-w-4xl">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {DAYS.map(day => (
                         <div key={day} className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50">
                            <div className="w-24 font-black text-slate-700 capitalize">{day}</div>
                            <div className="flex-1 flex gap-2">
                               <select 
                                 value={factoryConfig[activeSubTab][day].trend}
                                 onChange={(e) => handleFactoryChange(activeSubTab, day, "trend", e.target.value)}
                                 className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 font-bold text-slate-700 appearance-none"
                               >
                                  <option value="UP">UP 📈</option>
                                  <option value="DOWN">DOWN 📉</option>
                               </select>
                               <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 focus-within:border-blue-500">
                                  <input 
                                    type="number" 
                                    min="0" max="100"
                                    value={factoryConfig[activeSubTab][day].percentage}
                                    onChange={(e) => handleFactoryChange(activeSubTab, day, "percentage", Number(e.target.value))}
                                    className="w-16 py-2 outline-none text-sm font-black text-slate-900 text-right bg-transparent"
                                  />
                                  <span className="text-slate-400 font-bold text-sm">%</span>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                   
                   <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <button 
                        onClick={handleSaveFactory}
                        disabled={savingFactory}
                        className="py-3 px-8 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold text-sm transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] disabled:opacity-50"
                      >
                         {savingFactory ? "Saving..." : "Save Configuration"}
                      </button>
                   </div>
                </div>
             )}
          </div>
        )}

        {/* Modal Layer */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6">{editingId ? "Modify Route Rules" : "Initialize New Pricing"}</h3>

              <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Origin Node</label>
                  <CityAutocomplete
                    placeholder="Source City"
                    value={form.from}
                    onSelect={(city) => setForm({ ...form, from: city.name })}
                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 font-bold text-slate-700"
                  />
                </div>


                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Car Category Payload</label>
                  <select
                    required
                    value={form.car}
                    onChange={(e) => setForm({ ...form, car: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-bold text-slate-700 appearance-none transition-all"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Market Fare (INR)</label>
                    <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 font-black text-slate-900" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Initial Vector</label>
                    <select value={form.trend} onChange={(e) => setForm({ ...form, trend: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-bold text-slate-700 appearance-none">
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
