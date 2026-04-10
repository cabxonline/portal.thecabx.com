"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { 
  Key, Plus, Edit, Trash2, 
  Terminal, Search 
} from "lucide-react"
import { toast } from "sonner"

export default function PermissionRegistry() {
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchPermissions = async () => {
    try {
      const data = await api("/permissions")
      setPermissions(data)
    } catch (err) {
      toast.error("Registry access denied")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPermissions() }, [])

  const filtered = permissions.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.key.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex-1 bg-slate-50 min-h-[calc(100vh-4rem)] p-6 md:p-8" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900">Permission Registry</h1>
            <p className="text-slate-500 font-medium text-sm">A centralized ledger of all unique access keys and semantic descriptors.</p>
          </div>
          <div className="relative group flex items-center">
             <Search className="absolute left-4 w-4 h-4 text-slate-400" />
             <input 
               type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
               placeholder="Search by Key or Descriptor..." 
               className="pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold w-full md:w-[320px] focus:border-blue-500 transition-all outline-none shadow-sm"
             />
          </div>
        </div>

        {/* Registry Ledger */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64 italic text-slate-400">Syncing ledger data...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Access Key (Semantic)</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Descriptor</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest text-right">Operational Logic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-slate-100 rounded-lg text-slate-400 group-hover:text-blue-600 transition-colors">
                              <Terminal className="w-3.5 h-3.5" />
                           </div>
                           <span className="font-mono text-[13px] font-bold text-blue-600 tracking-tight">{p.key}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-slate-600">{p.name}</td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
                               <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                     <tr>
                        <td colSpan="3" className="px-8 py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-[11px]">No access vectors found matching query.</td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex justify-center">
           <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 shadow-xl text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-800 transition-all active:scale-95">
              <Plus className="w-3 h-3" /> Register System Access Vector
           </button>
        </div>

      </div>
    </div>
  )
}