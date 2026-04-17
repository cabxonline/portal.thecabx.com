"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import PermissionGuard from "@/components/permission-guard"
import {
  Users as UsersIcon,
  Mail,
  Phone,
  ShieldCheck,
  Trash2,
  Edit3,
  Plus,
  X,
  ChevronRight,
  User as UserIcon,
  Search,
  Filter
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function Customers() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    roleId: ""
  })

  const fetchData = async () => {
    try {
      const usersData = await api("/users")
      const rolesData = await api("/roles")

      // Filter for customers only
      const customers = usersData.filter(
        (user) => user.role?.name?.toLowerCase() === "customer"
      )

      setUsers(customers)
      setRoles(rolesData)
    } catch (err) {
      console.error("Customer fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await api(`/users/${editingUser.id}`, {
          method: "PUT",
          body: JSON.stringify(form)
        })
      } else {
        await api("/users", {
          method: "POST",
          body: JSON.stringify(form)
        })
      }
      setShowModal(false)
      setEditingUser(null)
      fetchData()
    } catch (err) {
      console.error("Submit error:", err)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this customer account?")) return
    try {
      await api(`/users/${id}`, {
        method: "DELETE"
      })
      fetchData()
    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M21 12a9 9 0 11-4-7.5" />
          </svg>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center">Syncing <br /> Customer Intelligence</p>
        </div>
      </div>
    )
  }

  return (
    <PermissionGuard permission="user.read">
      <div className="flex flex-1 flex-col w-full bg-slate-50 min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-6 py-6 md:py-8 px-4 md:px-8">

          {/* 🌟 HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg shadow-indigo-500/20 flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3" /> Identity Management
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-none">
                Customer Network
              </h2>
              <p className="text-slate-500 font-medium text-sm mt-3 max-w-md">
                Monitor registered users, track customer engagement metrics, and manage secure identity credentials.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingUser(null)
                setForm({ name: "", email: "", password: "", roleId: roles.find(r => r.name.toLowerCase() === 'customer')?.id || "" })
                setShowModal(true)
              }}
              className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-slate-900/10 hover:-translate-y-0.5 active:scale-95 group"
            >
              Create Account <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          {/* 🔍 FILTERS */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="Search by name, email, or account ID..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Filter className="w-3.5 h-3.5" /> Total Records: {users.length}
            </div>
          </div>

          {/* 📋 CUSTOMERS TABLE */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto selection:bg-indigo-50">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-[#fcfdfe] border-b border-slate-100 italic">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer Identity</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Communication</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Engagement Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-20 text-slate-300 font-bold uppercase text-xs tracking-widest">No Intelligence Records Found</td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                              <UserIcon className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-base leading-none mb-1.5">{user.name}</p>
                              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">Customer ID: Cabx00{user.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1.5">
                            <a href={`mailto:${user.email}`} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
                              <Mail className="w-3.5 h-3.5" /> {user.email}
                            </a>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                              <Phone className="w-3 h-3" /> {user.phone || "No contact verified"}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Verified Network
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right font-medium">
                          <div className="flex items-center justify-end gap-3">
                            <a
                              href={`/dashboard/customers/${user.id}`}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-black shadow-sm hover:bg-slate-900 hover:text-white transition-all group"
                            >
                              Manage Profile <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </a>
                            <button
                              onClick={() => {
                                setEditingUser(user)
                                setForm({ name: user.name, email: user.email, roleId: user.roleId })
                                setShowModal(true)
                              }}
                              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm active:scale-90"
                            >
                              <Edit3 className="w-4.5 h-4.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-all shadow-sm active:scale-90"
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
                    {editingUser ? "Edit Account" : "Create Account"}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">Configure secure credentials and identity</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Identity Name</label>
                  <input
                    placeholder="Enter full name"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 transition-all"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Communication Email</label>
                  <input
                    placeholder="name@example.com"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 transition-all"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Secure Authorization Key</label>
                    <input
                      placeholder="Enter strong password"
                      type="password"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 transition-all"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 px-6 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 text-sm"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-[2] py-4 px-6 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold transition-all shadow-xl shadow-slate-900/10 active:scale-95 text-sm"
                  >
                    {editingUser ? "Push Updates" : "Issue Account"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  )
}