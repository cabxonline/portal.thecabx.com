"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { 
  Ticket, Plus, Trash2, Tag, Calendar, Activity, X
} from "lucide-react"
import { toast } from "sonner"

export default function CouponsManager() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    code: "", title: "", description: "", termsConditions: "",
    discountType: "percentage", discountValue: "", maxDiscount: "", minOrderValue: "",
    targetCity: "", tripType: "", applicableOn: "both", targetRideCounts: "",
    startDate: "", endDate: "", maxUsagePerUser: "1", totalUsageLimit: "", isActive: true
  })

  const fetchCoupons = async () => {
    try {
      const data = await api("/coupons")
      setCoupons(data)
    } catch (err) {
      toast.error("Could not retrieve coupons")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCoupons() }, [])

  const handleCreateCoupon = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...formData }
      if (!payload.maxDiscount) delete payload.maxDiscount
      if (!payload.minOrderValue) delete payload.minOrderValue
      if (!payload.targetCity) delete payload.targetCity
      if (!payload.tripType) delete payload.tripType
      if (!payload.targetRideCounts) delete payload.targetRideCounts
      if (!payload.startDate) delete payload.startDate
      if (!payload.endDate) delete payload.endDate
      if (!payload.totalUsageLimit) delete payload.totalUsageLimit

      await api("/coupons", {
        method: "POST",
        body: JSON.stringify(payload)
      })
      toast.success("Coupon created successfully")
      setShowModal(false)
      fetchCoupons()
    } catch (err) {
      toast.error("Coupon creation failed")
    }
  }

  const handleDeleteCoupon = async (id) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return
    try {
      await api(`/coupons/${id}`, { method: "DELETE" })
      toast.success("Coupon deleted")
      fetchCoupons()
    } catch (err) {
      toast.error(err.message || "Deletion failed")
    }
  }

  const handleToggleStatus = async (coupon) => {
     try {
       await api(`/coupons/${coupon.id}`, {
         method: "PUT",
         body: JSON.stringify({ isActive: !coupon.isActive })
       })
       toast.success("Status updated")
       fetchCoupons()
     } catch(err) {
       toast.error("Failed to update status")
     }
  }

  return (
    <div className="flex-1 bg-slate-50 min-h-[calc(100vh-4rem)] p-6 md:p-8" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900">Coupons & Offers</h1>
            <p className="text-slate-500 font-medium text-sm">Manage dynamic pricing, offers, and discounts.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-xl hover:bg-slate-800 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Coupon
          </button>
        </div>

        {/* Coupons Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64 italic text-slate-400">Loading offers...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coupons.map(coupon => (
              <div key={coupon.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 group hover:border-blue-500 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${coupon.isActive ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Ticket className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => handleToggleStatus(coupon)}
                         className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                         title="Toggle Status"
                       >
                         <Activity className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => handleDeleteCoupon(coupon.id)}
                         className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                         title="Delete Coupon"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight">{coupon.code}</h3>
                  <p className="text-xs font-medium text-slate-400 mb-6 tracking-wide">{coupon.title}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Discount</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">
                        {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expiry</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 mt-1">
                        {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString() : 'No Expiry'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                     <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Applies To:</span> {coupon.applicableOn}</p>
                     {coupon.targetCity && <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">City:</span> {coupon.targetCity}</p>}
                     {coupon.tripType && <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Trip Type:</span> {coupon.tripType}</p>}
                     <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Usage:</span> {coupon.usedCount} {coupon.totalUsageLimit ? `/ ${coupon.totalUsageLimit}` : ''}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Create Coupon */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
             <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 my-8">
                <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                   <div>
                     <h2 className="text-2xl font-bold text-slate-900">Create New Coupon</h2>
                     <p className="text-sm font-medium text-slate-400 mt-1">Set rules and conditions for your offer.</p>
                   </div>
                   <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full shadow-sm"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleCreateCoupon} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 px-1">Coupon Code *</label>
                        <input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none uppercase" 
                          value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="e.g. SAVE20" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 px-1">Title *</label>
                        <input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-blue-500 outline-none" 
                          value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. 20% Off Airport Rides" />
                     </div>
                     <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold uppercase text-slate-500 px-1">Description</label>
                        <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-blue-500 outline-none" 
                          value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Internal notes or customer facing description..." />
                     </div>
                   </div>

                   <hr className="border-slate-100" />

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 px-1">Discount Type</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none"
                          value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}>
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (₹)</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 px-1">Discount Value *</label>
                        <input type="number" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none" 
                          value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} placeholder="e.g. 20" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 px-1">Max Discount (₹)</label>
                        <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none" 
                          value={formData.maxDiscount} onChange={e => setFormData({...formData, maxDiscount: e.target.value})} placeholder="Leave blank for no limit" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 px-1">Min Order Value (₹)</label>
                        <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none" 
                          value={formData.minOrderValue} onChange={e => setFormData({...formData, minOrderValue: e.target.value})} placeholder="e.g. 500" />
                     </div>
                   </div>

                   <hr className="border-slate-100" />

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 px-1">Target City</label>
                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-blue-500 outline-none" 
                          value={formData.targetCity} onChange={e => setFormData({...formData, targetCity: e.target.value})} placeholder="e.g. Lucknow" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 px-1">Trip Type</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-blue-500 outline-none"
                          value={formData.tripType} onChange={e => setFormData({...formData, tripType: e.target.value})}>
                          <option value="">Any</option>
                          <option value="airport">Airport</option>
                          <option value="local">Local</option>
                          <option value="roundtrip">Round Trip</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 px-1">Target Ride Counts JSON</label>
                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-blue-500 outline-none" 
                          value={formData.targetRideCounts} onChange={e => setFormData({...formData, targetRideCounts: e.target.value})} placeholder='e.g. [1, 3] for 1st or 3rd ride' />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 px-1">Applicable On</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-blue-500 outline-none"
                          value={formData.applicableOn} onChange={e => setFormData({...formData, applicableOn: e.target.value})}>
                          <option value="both">Both (Bookings & Packages)</option>
                          <option value="booking">Regular Bookings Only</option>
                          <option value="package">Packages Only</option>
                        </select>
                     </div>
                   </div>

                   <hr className="border-slate-100" />

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 px-1">Max Usage Per User</label>
                        <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none" 
                          value={formData.maxUsagePerUser} onChange={e => setFormData({...formData, maxUsagePerUser: e.target.value})} placeholder="Default: 1" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 px-1">Total Usage Limit</label>
                        <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none" 
                          value={formData.totalUsageLimit} onChange={e => setFormData({...formData, totalUsageLimit: e.target.value})} placeholder="e.g. 100 uses total" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 px-1">Start Date</label>
                        <input type="datetime-local" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-blue-500 outline-none" 
                          value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 px-1">End Date (Expiry)</label>
                        <input type="datetime-local" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-blue-500 outline-none" 
                          value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                     </div>
                   </div>

                   <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                      <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                      <button type="submit" className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-95">
                         Save Coupon
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
