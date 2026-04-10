"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { 
  UserPlus, Mail, Phone, Shield, MoreVertical, 
  Trash2, Edit, CheckCircle, XCircle 
} from "lucide-react"
import { toast } from "sonner"

export default function UserDirectory() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", roleId: ""
  })

  const fetchData = async () => {
    try {
      const [u, r] = await Promise.all([api("/users"), api("/roles")])
      setUsers(u)
      setRoles(r)
    } catch (err) {
      toast.error("Security vault access failed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingUser) {
        await api(`/users/${editingUser.id}`, {
          method: "PUT", body: JSON.stringify(form)
        })
        toast.success("Identity record synchronized")
      } else {
        await api("/users", {
          method: "POST", body: JSON.stringify(form)
        })
        toast.success("New operative registered. Welcome mail dispatched.")
      }
      setShowModal(false)
      setEditingUser(null)
      setForm({ name: "", email: "", password: "", phone: "", roleId: "" })
      fetchData()
    } catch (err) {
      toast.error(err.message || "Credential verification failed")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Permanently erase this identity from records?")) return
    try {
      await api(`/users/${id}`, { method: "DELETE" })
      toast.success("Identity decommissioned")
      fetchData()
    } catch (err) {
      toast.error("Decommissioning failed")
    }
  }

  return (
    <div className="flex-1 bg-slate-50 min-h-[calc(100vh-4rem)] p-6 md:p-8" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Management Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900">User Directory</h1>
            <p className="text-slate-500 font-medium text-sm">Synchronize identities and secure access vectors across the enterprise.</p>
          </div>
          <button 
            onClick={() => { setEditingUser(null); setForm({ name: "", email: "", password: "", phone: "", roleId: "" }); setShowModal(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Register Operative
          </button>
        </div>

        {/* Identity Registry Grid */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64 italic text-slate-400">Syncing with Registry...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Identity / Contact</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Security Clearance</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Enrollment Status</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm border-2 border-white shadow-sm uppercase">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-[15px]">{u.name}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                               <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                                  <Mail className="w-3 h-3" /> {u.email}
                               </div>
                               <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                                  <Phone className="w-3 h-3" /> {u.phone || "No Telemetry"}
                               </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl w-fit">
                           <Shield className="w-3.5 h-3.5 text-blue-600" />
                           <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{u.role?.name || "Member"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {u.isActive ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px] uppercase tracking-wider">
                            <CheckCircle className="w-3.5 h-3.5" /> Active
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                            <XCircle className="w-3.5 h-3.5" /> Suspended
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                             onClick={() => { setEditingUser(u); setForm({ name: u.name, email: u.email, phone: u.phone, roleId: u.roleId, password: "" }); setShowModal(true); }}
                             className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                             <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(u.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                             <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Identity Workspace */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
               <div className="bg-slate-50/50 px-10 py-8 border-b border-slate-100">
                  <h2 className="text-2xl font-bold text-slate-900">{editingUser ? "Modify Identity" : "Register New Operative"}</h2>
                  <p className="text-sm font-medium text-slate-400 mt-1">Populate core biometric and clearance data.</p>
               </div>
               <form onSubmit={handleSubmit} className="p-10 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Full Legal Name</label>
                        <input 
                           required className="w-full bg-slate-100/50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 transition-all outline-none" 
                           value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. John Doe"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Clearance Level</label>
                        <select 
                           required className="w-full bg-slate-100/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-blue-500 transition-all outline-none" 
                           value={form.roleId} onChange={e => setForm({...form, roleId: e.target.value})}
                        >
                           <option value="">Select Level</option>
                           {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Digital Vector (Email)</label>
                     <input 
                        type="email" required className="w-full bg-slate-100/50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 transition-all outline-none" 
                        value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@company.com"
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Access Key (Password)</label>
                        <input 
                           type="password" required={!editingUser} className="w-full bg-slate-100/50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 transition-all outline-none" 
                           value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder={editingUser ? "Leave blank to keep current" : "••••••••"}
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Telemetry (Phone)</label>
                        <input 
                           className="w-full bg-slate-100/50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 transition-all outline-none" 
                           value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 00000 00000"
                        />
                     </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                     <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Abort Mission</button>
                     <button type="submit" className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-95">
                        {editingUser ? "Synchronize Identity" : "Confirm Enrollment"}
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