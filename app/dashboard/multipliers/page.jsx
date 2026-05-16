"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Save, RefreshCcw, Info, TrendingUp, MapPin, Plane } from "lucide-react"
import { api } from "@/lib/api"

export default function MultipliersPage() {
    const [multipliers, setMultipliers] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const tripTypeLabels = {
        "roundtrip": { label: "Outstation Round-Trip", icon: <TrendingUp className="text-indigo-600" />, desc: "Default distance multiplier for outstation trips." },
        "local": { label: "Local Rental", icon: <MapPin className="text-emerald-600" />, desc: "Base KM multiplier for local 8hr/80km rentals." },
        "airport": { label: "Airport Transfer", icon: <Plane className="text-blue-600" />, desc: "Standard multiplier for airport pickup/drop routes." }
    }

    const fetchMultipliers = async () => {
        try {
            setLoading(true)
            const data = await api("/tyt/multipliers")
            
            // Ensure all trip types are present in the list
            const types = ["roundtrip", "local", "airport"]
            const formattedData = types.map(type => {
                const existing = data.find(m => m.tripType === type)
                return {
                    tripType: type,
                    multiplier: existing ? existing.multiplier : (type === "roundtrip" ? 300 : type === "local" ? 120 : 180)
                }
            })
            setMultipliers(formattedData)
        } catch (err) {
            toast.error("Failed to fetch multipliers")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMultipliers()
    }, [])

    const handleUpdate = (type, val) => {
        setMultipliers(prev => prev.map(m => 
            m.tripType === type ? { ...m, multiplier: val } : m
        ))
    }

    const saveAll = async () => {
        try {
            setSaving(true)
            await Promise.all(multipliers.map(m => 
                api("/tyt/multipliers", {
                    method: "POST",
                    body: JSON.stringify(m)
                })
            ))
            toast.success("All multipliers updated successfully")
        } catch (err) {
            toast.error("Failed to save some multipliers")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCcw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manual Rate Multipliers</h1>
                    <p className="text-slate-500 font-bold mt-1">Configure base distance and rate multipliers for all trip types.</p>
                </div>
                <button
                    onClick={saveAll}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-3.5 rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:bg-slate-300"
                >
                    {saving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save All Changes
                </button>
            </div>

            <div className="grid gap-6">
                {multipliers.map((m) => (
                    <div key={m.tripType} className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                                    {tripTypeLabels[m.tripType]?.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                                        {tripTypeLabels[m.tripType]?.label}
                                    </h3>
                                    <p className="text-slate-400 text-sm font-bold mt-0.5">
                                        {tripTypeLabels[m.tripType]?.desc}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <div className="px-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Multiplier Value</p>
                                    <input
                                        type="number"
                                        value={m.multiplier}
                                        onChange={(e) => handleUpdate(m.tripType, e.target.value)}
                                        className="bg-transparent border-none p-0 focus:ring-0 text-2xl font-black text-slate-900 w-32"
                                    />
                                </div>
                                <div className="w-px h-10 bg-slate-200" />
                                <div className="px-4 text-slate-400">
                                    <Info size={20} className="hover:text-blue-600 transition-colors cursor-help" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex items-center gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-50">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <p className="text-[11px] font-bold text-blue-700/80 uppercase tracking-wider">
                                Formula: (Base Rate ₹) × {m.multiplier} = Estimated Starting Fare
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-xl font-black mb-2">How these multipliers work?</h4>
                    <p className="text-slate-400 font-bold max-w-2xl text-sm leading-relaxed">
                        These multipliers act as the global baseline for your pricing engine. For example, if a Sedan route is priced at ₹11 in the ticker, and the Round-Trip multiplier is 300, the calculated booking fare will be ₹3,300 (11 × 300). Adjusting these will instantly update all live prices on the customer website.
                    </p>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <TrendingUp size={160} />
                </div>
            </div>
        </div>
    )
}
