"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import Link from "next/link"
import { 
  ShieldCheck, Users, Key, ChevronRight, 
  Settings, Plus, Trash2 
} from "lucide-react"
import { toast } from "sonner"

export default function RoleArchitect() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newRoleName, setNewRoleName] = useState("")

  const fetchRoles = async () => {
    try {
      const data = await api("/roles")
      setRoles(data)
    } catch (err) {
      toast.error("Could not retrieve security protocols")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRoles() }, [])

  const handleCreateRole = async (e) => {
    e.preventDefault()
    try {
      await api("/roles", {
        method: "POST",
        body: JSON.stringify({ name: newRoleName })
      })
      toast.success("Security group initialized")
      setNewRoleName("")
      setShowModal(false)
      fetchRoles()
    } catch (err) {
      toast.error("Group initialization failed")
    }
  }

  const handleDeleteRole = async (id) => {
    if (!confirm("Decommission this security group? This action is irreversible.")) return
    try {
      await api(`/roles/${id}`, { method: "DELETE" })
      toast.success("Security group erased")
      fetchRoles()
    } catch (err) {
      toast.error(err.message || "Decommission failed")
    }
  }

  return (
    <div className="flex-1 bg-slate-50 min-h-[calc(100vh-4rem)] p-6 md:p-8" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900">Role Architect</h1>
            <p className="text-slate-500 font-medium text-sm">Design security hierarchies and define operational boundaries.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-xl hover:bg-slate-800 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Initialize Security Group
          </button>
        </div>

        {/* Roles Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64 italic text-slate-400">Loading security protocols...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {roles.map(role => (
              <div key={role.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 group hover:border-blue-500 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <button 
                      onClick={() => handleDeleteRole(role.id)}
                      className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight">{role.name}</h3>
                  <p className="text-xs font-medium text-slate-400 mb-6 uppercase tracking-[0.1em]">Security Group ID: {String(role.id).slice(0, 8)}...</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operatives</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">{role._count?.users || 0}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Key className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Privileges</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">{role._count?.permissions || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Link 
                    href={`/dashboard/roles/${role.id}/permissions`}
                    className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl border border-slate-100 hover:border-blue-100 text-blue-600 transition-all font-bold text-sm"
                  >
                    <span>Manage Privileges</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <button className="flex items-center justify-center gap-2 w-full p-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                    <Settings className="w-3 h-3" />
                    Group Settings
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Group Initialization */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                <div className="bg-slate-50/50 px-10 py-8 border-b border-slate-100 text-center">
                   <h2 className="text-2xl font-bold text-slate-900">Initialize Security Group</h2>
                   <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-widest text-[10px]">Define a new operational tier.</p>
                </div>
                <form onSubmit={handleCreateRole} className="p-10 space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Semantic Label (Name)</label>
                      <input 
                        required autoFocus className="w-full bg-slate-100/50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 transition-all outline-none" 
                        value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="e.g. Operations Manager"
                      />
                   </div>
                   <div className="flex items-center gap-4">
                      <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                      <button type="submit" className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-95">
                         Confirm Initialization
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