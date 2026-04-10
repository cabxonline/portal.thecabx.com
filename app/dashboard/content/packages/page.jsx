"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import {
  Plus,
  Trash2,
  Pencil,
  Image as ImageIcon,
  Clock,
  Banknote,
  Tag,
  ListChecks,
  ChevronRight,
  Layers,
  X
} from "lucide-react"

export default function PackageManager() {
  const [packages, setPackages] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [operationLoading, setOperationLoading] = useState(false)
  
  const [form, setForm] = useState({
    title: "",
    price: "",
    duration: "",
    tag: "",
    categoryId: "",
    isActive: true,
    images: [""],
    features: [""]
  })

  const loadData = async () => {
    try {
      const [pkgs, cats] = await Promise.all([
        api("/packages"),
        api("/package-categories")
      ])
      setPackages(Array.isArray(pkgs) ? pkgs : (pkgs?.data || []))
      setCategories(Array.isArray(cats) ? cats : (cats?.data || []))
    } catch (err) {
      toast.error("Failed to load tour infrastructure.")
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
      
      // Clean up empty arrays
      const payload = {
        ...form,
        price: Number(form.price),
        images: form.images.filter(img => img.trim() !== ""),
        features: form.features.filter(feat => feat.trim() !== "")
      }

      if (editingId) {
        await api(`/packages/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        })
        toast.success("Tour package updated!")
      } else {
        await api("/packages", {
          method: "POST",
          body: JSON.stringify(payload)
        })
        toast.success("Tour package activated!")
      }
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      toast.error(err.message || "Failed to process package.")
    } finally {
      setOperationLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This will soft-delete the package.")) return
    try {
      await api(`/packages/${id}`, { method: "DELETE" })
      toast.success("Package archived.")
      loadData()
    } catch (err) {
      toast.error("Archive failure.")
    }
  }

  // --- Dynamic Array Helpers ---
  const addImageField = () => setForm({...form, images: [...form.images, ""]})
  const removeImageField = (index) => {
    const newImgs = [...form.images]
    newImgs.splice(index, 1)
    setForm({...form, images: newImgs})
  }
  const updateImageField = (val, index) => {
    const newImgs = [...form.images]
    newImgs[index] = val
    setForm({...form, images: newImgs})
  }

  const addFeatureField = () => setForm({...form, features: [...form.features, ""]})
  const removeFeatureField = (index) => {
    const newFeats = [...form.features]
    newFeats.splice(index, 1)
    setForm({...form, features: newFeats})
  }
  const updateFeatureField = (val, index) => {
    const newFeats = [...form.features]
    newFeats[index] = val
    setForm({...form, features: newFeats})
  }

  const openNewModal = () => {
    setForm({
      title: "",
      price: "",
      duration: "",
      tag: "",
      categoryId: categories[0]?.id || "",
      isActive: true,
      images: [""],
      features: [""]
    })
    setEditingId(null)
    setIsModalOpen(true)
  }

  const openEditModal = (pkg) => {
    setForm({
      title: pkg.title,
      price: pkg.price,
      duration: pkg.duration,
      tag: pkg.tag || "",
      categoryId: pkg.categoryId || "",
      isActive: pkg.isActive,
      images: pkg.images.length > 0 ? pkg.images : [""],
      features: pkg.features.length > 0 ? pkg.features : [""]
    })
    setEditingId(pkg.id)
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
    <div className="flex flex-1 flex-col w-full bg-slate-50 min-h-[calc(100vh-4rem)] text-slate-900">
      <div className="w-full max-w-7xl mx-auto py-6 md:py-8 px-4 md:px-8">

        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tour Packages</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Manage global tour listings and pricing structures.</p>
          </div>
          
          <button 
            onClick={openNewModal}
            className="py-2.5 px-5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold text-sm transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Package
          </button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                     <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Asset & Context</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Category</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Logistics</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Economy</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Modifiers</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {packages.map(pkg => (
                    <tr key={pkg.id} className="hover:bg-slate-50 transition-colors group">
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                                {pkg.images[0] ? <img src={pkg.images[0]} className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-3 text-slate-300" />}
                             </div>
                             <div>
                                <h4 className="font-black text-slate-900">{pkg.title}</h4>
                                {pkg.tag && <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter flex items-center gap-1"><Tag className="w-3 h-3" /> {pkg.tag}</span>}
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                             <Layers className="w-3 h-3 mr-1.5" />
                             {pkg.category?.name || "Uncategorized"}
                          </span>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase">
                             <Clock className="w-4 h-4 text-slate-400" />
                             {pkg.duration}
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="font-black text-slate-900 text-lg flex items-center">
                             <Banknote className="w-4 h-4 mr-1 text-emerald-500" /> ₹{pkg.price}
                          </div>
                       </td>
                       <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-all">
                          <div className="flex justify-end gap-1">
                             <button onClick={() => openEditModal(pkg)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                             <button onClick={() => handleDelete(pkg.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
        </div>

        {/* Modal Panel - Massive for complex data */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-2xl w-full shadow-2xl border border-slate-100 my-8">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter">/ TOUR ARCHITECTURE</h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
               </div>
               
               <form onSubmit={handleSubmit} className="space-y-6">
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Title & Identity</label>
                          <input required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold" />
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Economy (INR)</label>
                             <input required type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-black" />
                          </div>
                          <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Duration</label>
                             <input required value={form.duration} onChange={(e) => setForm({...form, duration: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold" placeholder="e.g. 5D/4N" />
                          </div>
                       </div>

                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Parent Category</label>
                          <select required value={form.categoryId} onChange={(e) => setForm({...form, categoryId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold appearance-none cursor-pointer">
                             {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                       </div>

                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Market Tag</label>
                          <input value={form.tag} onChange={(e) => setForm({...form, tag: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-xs" placeholder="e.g. BESTSELLER" />
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div>
                          <div className="flex items-center justify-between mb-1">
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image Registry</label>
                             <button type="button" onClick={addImageField} className="text-[10px] font-bold text-blue-600 hover:underline">Add URL</button>
                          </div>
                          <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                             {form.images.map((img, idx) => (
                               <div key={idx} className="flex gap-2">
                                  <input value={img} onChange={(e) => updateImageField(e.target.value, idx)} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none" placeholder="Image URL" />
                                  <button type="button" onClick={() => removeImageField(idx)} className="p-1.5 text-slate-300 hover:text-red-500"><X className="w-4 h-4" /></button>
                               </div>
                             ))}
                          </div>
                       </div>

                       <div>
                          <div className="flex items-center justify-between mb-1">
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Highlight Features</label>
                             <button type="button" onClick={addFeatureField} className="text-[10px] font-bold text-blue-600 hover:underline">Add Point</button>
                          </div>
                          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                             {form.features.map((feat, idx) => (
                               <div key={idx} className="flex gap-2">
                                  <input value={feat} onChange={(e) => updateFeatureField(e.target.value, idx)} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none" placeholder="e.g. Breakfast Included" />
                                  <button type="button" onClick={() => removeFeatureField(idx)} className="p-1.5 text-slate-300 hover:text-red-500"><X className="w-4 h-4" /></button>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-4 pt-6 border-t border-slate-100">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all">Discard Change</button>
                   <button type="submit" disabled={operationLoading} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 shadow-xl transition-all disabled:opacity-50">
                     {operationLoading ? "Synchronizing..." : "Deploy Configuration"}
                   </button>
                 </div>
               </form>
            </div>
          </div>
        )}

      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  )
}
