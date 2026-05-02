"use client"

import React, { useEffect, useState } from 'react'
import {
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    FileText,
    Globe,
    Clock,
    Filter,
    ArrowRight,
    ChevronRight,
    Calendar
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { api } from '@/lib/api'

export default function BlogsPage() {
    const [blogs, setBlogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchBlogs()
    }, [])

    const fetchBlogs = async () => {
        try {
            const data = await api('/blogs')
            setBlogs(data)
        } catch (err) {
            toast.error("Failed to fetch blogs")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this blog?")) return
        try {
            await api(`/blogs/${id}`, { method: 'DELETE' })
            toast.success("Blog deleted successfully")
            setBlogs(blogs.filter(b => b.id !== id))
        } catch (err) {
            toast.error("Failed to delete blog")
        }
    }

    const filteredBlogs = blogs.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="p-4 lg:p-8 selection:bg-blue-50">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg shadow-blue-500/20">Content Engine</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Blog Management</h2>
                    <p className="text-slate-500 font-medium text-sm mt-2 max-w-md">
                        Manage your website's articles, SEO metadata, and AI-optimized content structures.
                    </p>
                </div>

                <Link
                    href="/dashboard/content/blogs/create"
                    className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-slate-900/10 hover:-translate-y-0.5 active:scale-95 group"
                >
                    <Plus className="w-5 h-5" />
                    Write New Article
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Articles', value: blogs.length, icon: <FileText className="w-5 h-5 text-blue-600" /> },
                    { label: 'Live on Site', value: blogs.filter(b => b.isActive).length, icon: <Globe className="w-5 h-5 text-emerald-600" /> },
                    { label: 'Total Views', value: blogs.reduce((acc, b) => acc + (b.viewsCount || 0), 0), icon: <Eye className="w-5 h-5 text-indigo-600" /> },
                    { label: 'Last Published', value: blogs.length > 0 ? new Date(blogs[0].publishDate).toLocaleDateString() : 'N/A', icon: <Calendar className="w-5 h-5 text-rose-600" /> },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                            <p className="text-xl font-black text-slate-900 tabular-nums">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table/List View */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/30">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by title or category..."
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-3 rounded-xl border border-slate-200 hover:bg-white text-slate-600 transition-all">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#fcfdfe] border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Article Info</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">SEO & Stats</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-8 py-10 h-24 bg-slate-50/20"></td>
                                    </tr>
                                ))
                            ) : filteredBlogs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                <FileText className="w-8 h-8" />
                                            </div>
                                            <p className="font-bold text-slate-500 italic">No articles found in your vault.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredBlogs.map((blog) => (
                                <tr key={blog.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-sm">
                                                {blog.featuredImage ? (
                                                    <img src={blog.featuredImage} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-sm leading-tight mb-1 group-hover:text-blue-600 transition-colors">{blog.title}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase tracking-widest border border-blue-100">
                                                        {blog.category || 'Travel'}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 italic">/{blog.slug}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 text-slate-600">
                                                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                                                    <span className="text-[11px] font-black tabular-nums">{blog.viewsCount || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-600">
                                                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                    <span className="text-[11px] font-black tabular-nums">{blog.readTime || 5} min</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1.5">
                                                {blog.metaTitle && <span className="w-2 h-2 rounded-full bg-emerald-500" title="SEO Title Set" />}
                                                {blog.metaDescription && <span className="w-2 h-2 rounded-full bg-emerald-500" title="SEO Description Set" />}
                                                {blog.ogImage && <span className="w-2 h-2 rounded-full bg-indigo-500" title="Social Image Set" />}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${blog.isActive
                                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                                : "bg-slate-50 text-slate-400 border-slate-200"
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${blog.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                            {blog.isActive ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                            <Link
                                                href={`/dashboard/content/blogs/edit/${blog.id}`}
                                                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(blog.id)}
                                                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-500/5 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <a
                                                href={`https://thecabx.com/blogs/${blog.slug}`}
                                                target="_blank"
                                                className="p-2.5 rounded-xl bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-900/10 active:scale-90 transition-all"
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
