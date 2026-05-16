"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { RefreshCcw, History, ArrowUpRight, ArrowDownRight, Calendar, Search } from "lucide-react"
import { api } from "@/lib/api"

export default function TytLogsPage() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    const fetchLogs = async () => {
        try {
            setLoading(true)
            const data = await api("/tyt/daily-logs")
            setLogs(data)
        } catch (err) {
            toast.error("Failed to fetch logs")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    const filteredLogs = logs.filter(log => 
        log.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.car.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCcw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <History className="text-blue-600" /> Daily Rate Logs
                    </h1>
                    <p className="text-slate-500 font-bold mt-1">Audit history of all dynamic price adjustments.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search city or car..."
                            className="pl-11 pr-6 py-3 rounded-2xl bg-white border border-slate-200 focus:border-blue-500 outline-none font-bold text-sm min-w-[280px] shadow-sm transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={fetchLogs}
                        className="p-3.5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <RefreshCcw className="w-5 h-5 text-slate-600" />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Route / Category</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Monday Base</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Today Final</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trend (%)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredLogs.map((log) => {
                                const isUp = log.trend === "UP";
                                return (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                                                    <Calendar size={18} />
                                                </div>
                                                <span className="font-bold text-slate-900">
                                                    {new Date(log.date).toLocaleDateString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div>
                                                <p className="font-black text-slate-900 uppercase tracking-tight">{log.from}</p>
                                                <p className="text-[11px] font-bold text-slate-400 uppercase">{log.car}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-bold text-slate-500">₹{log.basePrice.toLocaleString('en-IN')}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-lg font-black text-slate-900">₹{log.finalPrice.toLocaleString('en-IN')}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider ${
                                                isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                            }`}>
                                                {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                {log.percentage}%
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    
                    {filteredLogs.length === 0 && (
                        <div className="p-20 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <History className="text-slate-300 w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900">No logs found</h3>
                            <p className="text-slate-500 font-bold mt-1">Try adjusting your search or wait for the next daily log.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
