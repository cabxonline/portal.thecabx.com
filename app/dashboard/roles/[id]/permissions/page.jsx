"use client"

import { useEffect, useState, use } from "react"
import { api } from "@/lib/api"
import { 
  ShieldAlert, CheckCircle, ChevronLeft, Save, 
  Terminal, ShieldCheck, Search
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function PermissionAssignment({ params }) {
  const { id } = use(params)
  const [role, setRole] = useState(null)
  const [allPermissions, setAllPermissions] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchData = async () => {
    try {
       const [roleData, permsData] = await Promise.all([
          api(`/roles/${id}`),
          api("/permissions")
       ])
       setRole(roleData)
       setAllPermissions(permsData)
       setSelectedIds(roleData.permissions?.map(p => p.permissionId) || [])
    } catch (err) {
       toast.error("Security vault sync failed")
    } finally {
       setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [id])

  const togglePermission = (pId) => {
     setSelectedIds(prev => 
        prev.includes(pId) ? prev.filter(x => x !== pId) : [...prev, pId]
     )
  }

  const handleSync = async () => {
     setSyncing(true)
     try {
        await api(`/roles/${id}/permissions-bulk`, {
           method: "POST",
           body: JSON.stringify({ permissions: selectedIds })
        })
        toast.success("Security privileges synchronized")
        fetchData()
     } catch (err) {
        toast.error("Atomic synchronization failed")
     } finally {
        setSyncing(false)
     }
  }

  const filtered = allPermissions.filter(p => 
     p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.key.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
     return <div className="flex-1 bg-slate-50 flex items-center justify-center min-h-[calc(100vh-4rem)] italic text-slate-400">Loading access vectors...</div>
  }

  return (
    <div className="flex-1 bg-slate-50 min-h-[calc(100vh-4rem)] p-6 md:p-8" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Breadcrumb & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="space-y-1">
              <Link href="/dashboard/roles" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-[10px] uppercase tracking-widest mb-2 transition-colors">
                 <ChevronLeft className="w-3.5 h-3.5" /> Back to Architect
              </Link>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                 Privilege Matrix <span className="text-slate-300">/</span> <span className="text-blue-600">{role?.name}</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm">Synchronize granular access vectors for this security group.</p>
           </div>
           
           <button 
             onClick={handleSync} disabled={syncing}
             className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
           >
              {syncing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
              Synchronize Privileges
           </button>
        </div>

        {/* Permission Grid */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <ShieldCheck className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Active Privileges</p>
                    <p className="text-xl font-bold text-slate-900 transition-all">{selectedIds.length} <span className="text-sm font-medium text-slate-400 italic">assigned to {role?.name}</span></p>
                 </div>
              </div>
              <div className="relative group flex-1 max-w-sm">
                 <Search className="absolute left-4 w-4 h-4 text-slate-400" />
                 <input 
                   type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                   placeholder="Filter system vectors..." 
                   className="pl-11 pr-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold w-full focus:bg-white focus:border-blue-500 transition-all outline-none"
                 />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(p => {
                 const isActive = selectedIds.includes(p.id)
                 return (
                    <button 
                       key={p.id} onClick={() => togglePermission(p.id)}
                       className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all group relative overflow-hidden ${
                          isActive 
                          ? "bg-white border-blue-600 shadow-md ring-4 ring-blue-50" 
                          : "bg-white border-transparent hover:border-slate-200 shadow-sm"
                       }`}
                    >
                       <div className="flex items-center gap-4 relative z-10">
                          <div className={`p-3 rounded-2xl transition-all ${isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                             <Terminal className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                             <p className={`font-mono text-[11px] font-bold ${isActive ? "text-blue-600" : "text-slate-400"} uppercase tracking-tight`}>{p.key}</p>
                             <p className="font-bold text-slate-900 text-sm mt-0.5">{p.name}</p>
                          </div>
                       </div>
                       
                       <div className="relative z-10">
                          {isActive ? (
                             <CheckCircle className="w-6 h-6 text-blue-600 animate-in zoom-in-50 duration-200" />
                          ) : (
                             <div className="w-6 h-6 rounded-full border-2 border-slate-100 group-hover:border-slate-300 transition-colors"></div>
                          )}
                       </div>

                       {isActive && (
                          <div className="absolute top-0 right-0 p-1">
                             <div className="w-0 h-0 border-t-[30px] border-l-[30px] border-t-blue-600 border-l-transparent"></div>
                          </div>
                       )}
                    </button>
                 )
              })}
           </div>

           {filtered.length === 0 && (
              <div className="bg-white rounded-[2rem] p-20 text-center border-2 border-dashed border-slate-100 italic text-slate-400 font-bold">
                 No system access vectors matching filter.
              </div>
           )}
        </div>

      </div>
    </div>
  )
}
