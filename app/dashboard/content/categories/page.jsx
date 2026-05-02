"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import {
  Plus,
  Trash2,
  Pencil,
  Image as ImageIcon,
  CheckCircle2,
  XCircle
} from "lucide-react"

export default function CategoryManager() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [operationLoading, setOperationLoading] = useState(false)
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    isActive: true
  })

  const loadData = async () => {
    try {
      const res = await api("/package-categories")
      setCategories(Array.isArray(res) ? res : (res?.data || []))
    } catch (err) {
      toast.error("Failed to load categories.")
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
      if (editingId) {
        await api(`/package-categories/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(form)
        })
        toast.success("Category updated!")
      } else {
        await api("/package-categories", {
          method: "POST",
          body: JSON.stringify(form)
        })
        toast.success("Category created!")
      }
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      toast.error(err.message || "Failed to save category.")
    } finally {
      setOperationLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This will soft-delete the category.")) return
    try {
      await api(`/package-categories/${id}`, { method: "DELETE" })
      toast.success("Category deactivated.")
      loadData()
    } catch (err) {
      toast.error("Delete failed.")
    }
  }

  const openNewModal = () => {
    setForm({ name: "", description: "", image: "", isActive: true })
    setEditingId(null)
    setIsModalOpen(true)
  }

  const openEditModal = (cat) => {
    setForm({
      name: cat.name,
      description: cat.description || "",
      image: cat.image || "",
      isActive: cat.isActive
    })
    setEditingId(cat.id)
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
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Package Categories</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Organize your tour packages into logical groups.</p>
          </div>
          
          <button 
            onClick={openNewModal}
            className="py-2.5 px-5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold text-sm transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col group">
              <div className="aspect-video w-full bg-slate-100 flex items-center justify-center overflow-hidden relative">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-slate-300" />
                )}
                {!cat.isActive && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">Inactive</span>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                 <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-black text-slate-900">{cat.name}</h3>
                    {cat.isActive ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-slate-300" />}
                 </div>

                 {cat.description && (
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-4 leading-relaxed italic">
                      {cat.description}
                    </p>
                  )}
                 
                 <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                    <button onClick={() => openEditModal(cat)} className="flex-1 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                       <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                       <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
               <ImageIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-400 font-bold">No categories established yet.</p>
            </div>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
               <h3 className="text-xl font-black text-slate-900 mb-6">{editingId ? "Modify Category" : "Establish New Category"}</h3>
               
               <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Category Designation</label>
                   <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-bold" placeholder="e.g. Honeymoon Special" />
                 </div>

                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Visual Asset URL</label>
                   <input value={form.image} onChange={(e) => setForm({...form, image: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-bold" placeholder="https://image-link.com/..." />
                 </div>

                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Summary Description</label>
                   <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 font-bold min-h-[100px] resize-none" placeholder="Briefly describe this category..." />
                 </div>

                 <div className="flex items-center gap-2 py-2">
                    <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="isActive" className="text-sm font-bold text-slate-600">Active and Visible</label>
                 </div>

                 <div className="flex gap-3 pt-4 border-t border-slate-100">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-400 hover:bg-slate-50">Cancel</button>
                   <button type="submit" disabled={operationLoading} className="flex-1 py-3 bg-blue-600 rounded-xl font-bold text-sm text-white hover:bg-blue-700 shadow-md transition-colors disabled:opacity-50">
                     {operationLoading ? "Saving..." : "Push Logic"}
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
