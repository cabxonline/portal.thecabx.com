"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import {
    Search,
    Filter,
    Mail,
    Phone,
    Calendar,
    Clock,
    ChevronDown,
    MoreVertical,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Inbox, X,
    Navigation,
    ArrowRight
} from "lucide-react"

const statusConfig = {
    pending: { color: "bg-amber-100 text-amber-700 border-amber-200", row: "bg-yellow-50/40", icon: <Clock className="w-3 h-3" />, label: "Pending" },
    contacted: { color: "bg-blue-100 text-blue-700 border-blue-200", row: "bg-blue-50/40", icon: <Phone className="w-3 h-3" />, label: "Contacted" },
    spam: { color: "bg-red-100 text-red-700 border-red-200", row: "bg-red-50/40", icon: <XCircle className="w-3 h-3" />, label: "Spam" },
    fake: { color: "bg-slate-100 text-slate-700 border-slate-200", row: "bg-slate-50/50", icon: <AlertCircle className="w-3 h-3" />, label: "Fake" },
    confirmed: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", row: "bg-emerald-50/60", icon: <CheckCircle2 className="w-3 h-3" />, label: "Confirmed" },
    closed: { color: "bg-emerald-200 text-emerald-900 border-emerald-300", row: "bg-emerald-100/40", icon: <Inbox className="w-3 h-3" />, label: "Closed" },
    cancelled: { color: "bg-red-100 text-red-700 border-red-200", row: "bg-red-100/30", icon: <X className="w-3 h-3" />, label: "Cancelled" }
}

export default function TYTEnquiryManager() {
    const [enquiries, setEnquiries] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [updatingId, setUpdatingId] = useState(null)

    const loadEnquiries = async () => {
        try {
            setLoading(true)
            const query = new URLSearchParams()
            if (statusFilter !== "all") query.append("status", statusFilter)
            if (searchTerm) query.append("search", searchTerm)

            const data = await api(`/package-enquiries?${query.toString()}`)
            // Filter only TYT enquiries
            const tytOnly = (data || []).filter(e => e.stockId !== null)
            setEnquiries(tytOnly)
        } catch (err) {
            toast.error("Failed to load TYT enquiries")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            loadEnquiries()
        }, 300)
        return () => clearTimeout(delaySearch)
    }, [searchTerm, statusFilter])

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            setUpdatingId(id)
            await api(`/package-enquiries/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: newStatus })
            })
            setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e))
            toast.success(`Status updated to ${newStatus}`)
        } catch (err) {
            toast.error("Failed to update status")
        } finally {
            setUpdatingId(null)
        }
    }

    if (loading && enquiries.length === 0) {
        return (
            <div className="flex flex-1 items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold text-sm tracking-tight uppercase">Loading TYT Command Console...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col w-full bg-slate-50 min-h-[calc(100vh-4rem)] text-slate-900">
            <div className="w-full max-w-7xl mx-auto py-6 md:py-8 px-4 md:px-8">

                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            TYT Command <div className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-md tracking-widest uppercase italic border border-indigo-200 shadow-sm">Trade Inbound</div>
                        </h1>
                        <p className="text-slate-500 font-medium text-sm mt-1">Manage and track trade inquiries from the "Trade Your Travel" ticker.</p>
                    </div>

                    <div className="flex items-center gap-3 group">
                        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm group-hover:border-indigo-300 transition-all">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{enquiries.length} Active Trades</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-10 flex flex-col md:flex-row items-center gap-4">
                    <div className="w-full md:flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search trades by name, phone or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold transition-all shadow-sm text-sm"
                        />
                    </div>

                    <div className="w-full md:w-64 relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold transition-all shadow-sm text-sm appearance-none cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            {Object.entries(statusConfig).map(([key, config]) => (
                                <option key={key} value={key}>{config.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Customer Intel</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Trade Route Details</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {enquiries.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-4 bg-slate-100 rounded-full">
                                                    <Inbox className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <p className="font-bold text-slate-400 text-sm">No TYT enquiries found in the matrix.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    enquiries.map(enquiry => (
                                        <tr key={enquiry.id} className={`transition-all duration-300 group hover:brightness-[0.98] ${statusConfig[enquiry.status]?.row || "bg-white"}`}>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xl shadow-inner">
                                                        {enquiry.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-900 text-lg leading-tight">{enquiry.name}</h4>
                                                        <div className="flex flex-col gap-0.5 mt-1">
                                                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><Phone className="w-3 h-3" /> {enquiry.phone}</span>
                                                            {enquiry.email && <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><Mail className="w-3 h-3" /> {enquiry.email}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-1.5 bg-indigo-50 rounded-lg border border-indigo-100">
                                                            <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-black text-slate-900">{enquiry.stock?.from}</span>
                                                            <ArrowRight className="w-3 h-3 text-slate-300" />
                                                            <span className="text-sm font-black text-slate-900">{enquiry.stock?.car}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 ml-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Trade Interest</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="relative group/select w-fit">
                                                    {updatingId === enquiry.id ? (
                                                        <div className="animate-pulse px-3 py-1 bg-slate-100 rounded-full h-7 w-24"></div>
                                                    ) : (
                                                        <select
                                                            disabled={updatingId === enquiry.id}
                                                            value={enquiry.status}
                                                            onChange={(e) => handleStatusUpdate(enquiry.id, e.target.value)}
                                                            className={`
                                                                pl-3 pr-8 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer outline-none appearance-none
                                                                ${statusConfig[enquiry.status]?.color || "bg-slate-100 border-slate-200"}
                                                            `}
                                                        >
                                                            {Object.entries(statusConfig).map(([key, config]) => (
                                                                <option key={key} value={key}>{config.label}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                    {!updatingId && <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-40" />}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => {
                                                        const msg = enquiry.message || "No specific requirements provided.";
                                                        toast.info("Customer Message", {
                                                            description: msg,
                                                            duration: 5000,
                                                        });
                                                    }}
                                                    className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-bold-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100 active:scale-95"
                                                    title="View Message"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    )
}
