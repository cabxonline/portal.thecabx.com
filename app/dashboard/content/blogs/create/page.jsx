"use client"

import React, { useState, useEffect } from 'react'
import {
    ArrowLeft,
    Save,
    Image as ImageIcon,
    Globe,
    Settings,
    Eye,
    Plus,
    X,
    Info,
    ChevronDown,
    Layout
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Editor } from '@tinymce/tinymce-react'

export default function CreateBlogPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('content')
    const [uploadingImage, setUploadingImage] = useState(false)

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        author: 'Admin',
        category: 'Travel',
        tags: '',
        isActive: true,
        publishDate: new Date().toISOString().split('T')[0],

        featuredImage: '',
        imageAltText: '',
        imageTitle: '',
        imageCaption: '',

        metaTitle: '',
        metaDescription: '',
        focusKeyword: '',
        canonicalUrl: '',
        robots: 'index, follow',

        ogTitle: '',
        ogDescription: '',
        ogImage: '',

        faqSchema: [], // Array of { question, answer }
        readTime: 5,
    })

    // Auto-generate slug from title
    useEffect(() => {
        if (formData.title && !formData.slug) {
            const slug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setFormData(prev => ({ ...prev, slug }));
        }
    }, [formData.title])

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleImageUpload = async (e, fieldName) => {
        const file = e.target.files[0]
        if (!file) return

        const uploadFormData = new FormData()
        uploadFormData.append('image', file)

        setUploadingImage(true)
        try {
            // We use the backend upload endpoint
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/upload`, {
                method: 'POST',
                body: uploadFormData
            })
            const data = await res.json()
            if (data.url) {
                setFormData(prev => ({ ...prev, [fieldName]: data.url }))
                toast.success("Image uploaded successfully")
            }
        } catch (err) {
            toast.error("Image upload failed")
        } finally {
            setUploadingImage(false)
        }
    }

    const handleFaqChange = (index, field, value) => {
        const newFaqs = [...formData.faqSchema]
        newFaqs[index][field] = value
        setFormData(prev => ({ ...prev, faqSchema: newFaqs }))
    }

    const addFaq = () => {
        setFormData(prev => ({
            ...prev,
            faqSchema: [...prev.faqSchema, { question: '', answer: '' }]
        }))
    }

    const removeFaq = (index) => {
        setFormData(prev => ({
            ...prev,
            faqSchema: prev.faqSchema.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await api('/blogs', {
                method: 'POST',
                body: JSON.stringify(formData)
            })
            toast.success("Blog post created successfully!")
            router.push('/dashboard/content/blogs')
        } catch (err) {
            toast.error(err.message || "Failed to create blog post")
        } finally {
            setLoading(false)
        }
    }

    const categories = ["Travel", "Cab Booking", "Guides", "Company News", "Pricing", "Airport Transfers"]

    return (
        <div className="p-4 lg:p-8 max-w-6xl mx-auto selection:bg-blue-50">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/content/blogs"
                        className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create New Article</h2>
                        <p className="text-slate-500 text-sm font-medium italic">Compose an SEO-optimized masterpiece.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 rounded-2xl font-bold text-slate-600 hover:bg-white transition-all"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Publishing...' : (
                            <>
                                <Save className="w-4 h-4" />
                                Publish Article
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm mb-8 w-fit">
                {[
                    { id: 'content', label: 'Content & Media', icon: <Layout className="w-4 h-4" /> },
                    { id: 'seo', label: 'SEO & Meta', icon: <Globe className="w-4 h-4" /> },
                    { id: 'advanced', label: 'Advanced / FAQ', icon: <Settings className="w-4 h-4" /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${activeTab === tab.id
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                                : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                {/* CONTENT TAB */}
                {activeTab === 'content' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Main Editor */}
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Article Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Enter a catchy, keyword-rich title..."
                                        className="w-full text-2xl font-black bg-slate-50 border-none rounded-2xl p-4 focus:ring-0 focus:bg-white transition-all placeholder:text-slate-300"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">URL Slug</label>
                                    <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-2 border border-slate-100">
                                        <span className="text-slate-400 font-bold text-xs italic">thecabx.com/blogs/</span>
                                        <input
                                            type="text"
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleInputChange}
                                            className="flex-1 bg-transparent border-none text-xs font-bold text-blue-600 focus:ring-0 p-0"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Body Content</label>
                                    <div className="border border-slate-200 rounded-2xl overflow-hidden min-h-[500px]">
                                        <Editor
                                            apiKey='bxxmd7an995rn5hgs5his2zqc97326zka6mm3a55275iw9xe' // Replace with your key
                                            init={{
                                                height: 600,
                                                menubar: true,
                                                plugins: [
                                                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                                ],
                                                toolbar: 'undo redo | blocks | ' +
                                                    'bold italic forecolor | alignleft aligncenter ' +
                                                    'alignright alignjustify | bullist numlist outdent indent | ' +
                                                    'removeformat | help',
                                                content_style: 'body { font-family:Inter,Helvetica,Arial,sans-serif; font-size:16px }'
                                            }}
                                            value={formData.content}
                                            onEditorChange={(content) => setFormData(prev => ({ ...prev, content }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Excerpt */}
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Excerpt (Short Summary)</label>
                                    <span className="text-[10px] font-bold text-slate-300 italic">{formData.excerpt.length}/160</span>
                                </div>
                                <textarea
                                    name="excerpt"
                                    value={formData.excerpt}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-0 focus:bg-white transition-all text-sm font-medium"
                                    placeholder="Brief summary for SERP results and social shares..."
                                />
                            </div>
                        </div>

                        {/* Sidebar Column */}
                        <div className="space-y-6">
                            {/* Publishing Info */}
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                                <h3 className="font-black text-slate-900 text-sm italic mb-4">Publishing Settings</h3>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Status</label>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                            className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-xs font-black text-slate-700">Make Live on Site</span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-black"
                                    >
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Publish Date</label>
                                    <input
                                        type="date"
                                        name="publishDate"
                                        value={formData.publishDate}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-black"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Estimated Read Time (Mins)</label>
                                    <input
                                        type="number"
                                        name="readTime"
                                        value={formData.readTime}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-black"
                                    />
                                </div>
                            </div>

                            {/* Featured Image */}
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                                <h3 className="font-black text-slate-900 text-sm italic mb-4">Featured Media</h3>

                                <div className="relative group">
                                    <div className={`w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 overflow-hidden ${formData.featuredImage ? 'border-none' : ''}`}>
                                        {formData.featuredImage ? (
                                            <img src={formData.featuredImage} alt="Featured" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm mb-2">
                                                    <ImageIcon className="w-5 h-5" />
                                                </div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Click to upload</p>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'featuredImage')}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            disabled={uploadingImage}
                                        />
                                    </div>
                                    {uploadingImage && (
                                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Uploading...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 pt-2">
                                    <input
                                        type="text"
                                        name="imageAltText"
                                        value={formData.imageAltText}
                                        onChange={handleInputChange}
                                        placeholder="ALT Text (SEO)"
                                        className="w-full bg-slate-50 border-none rounded-xl p-3 text-[10px] font-bold"
                                    />
                                    <input
                                        type="text"
                                        name="imageCaption"
                                        value={formData.imageCaption}
                                        onChange={handleInputChange}
                                        placeholder="Image Caption"
                                        className="w-full bg-slate-50 border-none rounded-xl p-3 text-[10px] font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SEO TAB */}
                {activeTab === 'seo' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight italic border-b border-slate-100 pb-4">On-Page SEO</h3>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Meta Title</label>
                                    <span className={`text-[9px] font-bold ${formData.metaTitle.length > 60 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                        {formData.metaTitle.length}/60
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    name="metaTitle"
                                    value={formData.metaTitle}
                                    onChange={handleInputChange}
                                    placeholder="Recommended 60 characters..."
                                    className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-0 focus:bg-white transition-all shadow-inner"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Meta Description</label>
                                    <span className={`text-[9px] font-bold ${formData.metaDescription.length > 160 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                        {formData.metaDescription.length}/160
                                    </span>
                                </div>
                                <textarea
                                    name="metaDescription"
                                    value={formData.metaDescription}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Recommended 155-160 characters..."
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-0 focus:bg-white transition-all shadow-inner"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Focus Keyword</label>
                                    <input
                                        type="text"
                                        name="focusKeyword"
                                        value={formData.focusKeyword}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Robots</label>
                                    <select
                                        name="robots"
                                        value={formData.robots}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold"
                                    >
                                        <option value="index, follow">Index, Follow</option>
                                        <option value="noindex, follow">NoIndex, Follow</option>
                                        <option value="noindex, nofollow">NoIndex, NoFollow</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Canonical URL</label>
                                <input
                                    type="text"
                                    name="canonicalUrl"
                                    value={formData.canonicalUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://thecabx.com/blogs/..."
                                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-medium"
                                />
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight italic border-b border-slate-100 pb-4">Social Media (Open Graph)</h3>

                            <div className="relative aspect-[1.91/1] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden">
                                {formData.ogImage || formData.featuredImage ? (
                                    <img src={formData.ogImage || formData.featuredImage} alt="OG" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center">
                                        <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">OG Image (1200x630)</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, 'ogImage')}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">OG Title</label>
                                <input
                                    type="text"
                                    name="ogTitle"
                                    value={formData.ogTitle || formData.metaTitle}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">OG Description</label>
                                <textarea
                                    name="ogDescription"
                                    value={formData.ogDescription || formData.metaDescription}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ADVANCED TAB */}
                {activeTab === 'advanced' && (
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight italic">FAQ Schema (JSON-LD)</h3>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Boost ranking with Rich Snippets</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={addFaq}
                                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
                                >
                                    <Plus className="w-4 h-4" /> Add Question
                                </button>
                            </div>

                            <div className="space-y-4">
                                {formData.faqSchema.map((faq, index) => (
                                    <div key={index} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 relative group">
                                        <button
                                            type="button"
                                            onClick={() => removeFaq(index)}
                                            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border border-slate-200 text-rose-500 shadow-sm flex items-center justify-center hover:bg-rose-50 transition-all"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Question</label>
                                            <input
                                                type="text"
                                                value={faq.question}
                                                onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                                                className="w-full bg-white border-slate-200 rounded-xl p-3 text-sm font-bold shadow-sm"
                                                placeholder="e.g. How do I book a cab in Lucknow?"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Answer</label>
                                            <textarea
                                                value={faq.answer}
                                                onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                                                rows={2}
                                                className="w-full bg-white border-slate-200 rounded-xl p-3 text-sm font-medium shadow-sm"
                                                placeholder="Provide a clear, detailed answer..."
                                            />
                                        </div>
                                    </div>
                                ))}

                                {formData.faqSchema.length === 0 && (
                                    <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mx-auto mb-4">
                                            <Info className="w-8 h-8" />
                                        </div>
                                        <p className="text-slate-400 font-bold italic text-sm">No FAQs defined. Click "Add Question" to start building your schema.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight italic mb-6">Miscellaneous</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Tags (Comma Separated)</label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleInputChange}
                                        placeholder="Lucknow, Travel, Booking Guide..."
                                        className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Comments</label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <input
                                            type="checkbox"
                                            name="commentsEnabled"
                                            checked={formData.commentsEnabled}
                                            onChange={handleInputChange}
                                            className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-xs font-black text-slate-700">Enable user comments on this article</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    )
}
