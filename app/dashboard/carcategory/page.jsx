"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import PermissionGuard from "@/components/permission-guard"
import {
  Car,
  Users,
  Plus,
  Pencil,
  Trash2,
  CarFront,
  Truck,
  Bus,
  Search,
  LayoutGrid,
  Info
} from "lucide-react"
import { toast } from "sonner"

const getCategoryIcon = (name) => {
  const n = name.toLowerCase()
  if (n.includes("sedan")) return <Car className="w-6 h-6" />
  if (n.includes("suv")) return <CarFront className="w-6 h-6" />
  if (n.includes("prime") || n.includes("luxury")) return <Car className="w-6 h-6 text-amber-500" />
  if (n.includes("bus") || n.includes("traveler")) return <Bus className="w-6 h-6" />
  if (n.includes("mini")) return <CarFront className="w-6 h-6 scale-90" />
  return <Truck className="w-6 h-6" />
}

export default function CarCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  const [form, setForm] = useState({
    name: "",
    capacity: ""
  })

  const fetchCategories = async () => {
    try {
      const data = await api("/car-categories")
      setCategories(data)
    } catch (err) {
      toast.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: "", capacity: "" })
    setShowModal(true)
  }

  const openEdit = (category) => {
    setEditing(category)
    setForm({
      name: category.name,
      capacity: category.capacity
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api(`/car-categories/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(form)
        })
        toast.success("Category updated successfully")
      } else {
        await api("/car-categories", {
          method: "POST",
          body: JSON.stringify(form)
        })
        toast.success("New category created")
      }
      setShowModal(false)
      fetchCategories()
    } catch (err) {
      toast.error("Failed to save category")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category? This might affect existing bookings and vehicles.")) return
    try {
      await api(`/car-categories/${id}`, { method: "DELETE" })
      toast.success("Category removed")
      fetchCategories()
    } catch (err) {
      toast.error("Deletion failed. It might be linked to active data.")
    }
  }

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500 animate-pulse">Syncing categories...</p>
        </div>
      </div>
    )
  }

  return (
    <PermissionGuard permission="car.read">
      <div className="max-w-10xl mx-auto space-y-8 animate-in fade-in duration-700">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <LayoutGrid className="text-blue-600 w-8 h-8" />
              Car Categories
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Manage vehicle classes, seating capacities, and market positioning.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all w-full md:w-64 font-bold text-slate-700"
              />
            </div>
            <button
              onClick={openCreate}
              className="py-3 px-6 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 font-bold text-sm transition-all active:scale-[0.98] shadow-[0_10px_30px_rgba(37,99,235,0.3)] flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Category
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((cat, i) => (
            <div
              key={cat.id}
              className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:-translate-y-2 transition-all duration-500 cursor-default"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
                  {getCategoryIcon(cat.name)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-black text-slate-900 leading-tight">
                  {cat.name}
                </h3>

                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl w-fit">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-black text-slate-600 uppercase tracking-tighter">
                    {cat.capacity} Seater
                  </span>
                </div>
              </div>

              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="col-span-full py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-6">
                <Car className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-400">No categories found</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-xs">Try adjusting your search or add a new category to get started.</p>
            </div>
          )}
        </div>

        {/* Modal Layer */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] p-8 md:p-12 max-w-lg w-full shadow-2xl border border-slate-100 scale-in-center overflow-hidden relative">

              {/* Decorative background element */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -z-10"></div>

              <div className="mb-10">
                <div className="w-16 h-16 rounded-[2rem] bg-blue-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-200 ring-8 ring-blue-50">
                  {editing ? <Pencil className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  {editing ? "Modify Category" : "Build New Category"}
                </h2>
                <p className="text-slate-500 font-medium text-sm mt-2">
                  {editing ? "Refine the class details and capacity." : "Define a new vehicle class for the marketplace."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Class Identity</label>
                  <input
                    required
                    placeholder="e.g. Premium Sedan"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold text-slate-700"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Seating Payload</label>
                  <div className="relative">
                    <Users className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      required
                      placeholder="e.g. 4"
                      type="number"
                      className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold text-slate-700 placeholder:font-medium"
                      value={form.capacity}
                      onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 bg-white border border-slate-100 rounded-[1.5rem] font-bold text-sm text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-blue-600 rounded-[1.5rem] font-bold text-sm text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95"
                  >
                    {editing ? "Save Transformations" : "Activate Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  )
}