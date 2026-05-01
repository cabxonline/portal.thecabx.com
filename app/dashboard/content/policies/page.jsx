"use client"

import { useState, useEffect, useRef } from "react"
import { Editor } from "@tinymce/tinymce-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Shield, Save, Loader2, FileText, History } from "lucide-react"

export default function PoliciesPage() {
  const [policies, setPolicies] = useState([])
  const [selectedKey, setSelectedKey] = useState("terms-and-condition")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")
  
  const editorRef = useRef(null)

  useEffect(() => {
    fetchPolicies()
  }, [])

  useEffect(() => {
    const current = policies.find(p => p.key === selectedKey)
    if (current) {
      setTitle(current.title)
      setContent(current.content)
    }
  }, [selectedKey, policies])

  async function fetchPolicies() {
    try {
      setLoading(true)
      const data = await api("/policies")
      setPolicies(data)
      const current = data.find(p => p.key === selectedKey)
      if (current) {
        setTitle(current.title)
        setContent(current.content)
      }
    } catch (err) {
      toast.error("Failed to load policies")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      const finalContent = editorRef.current ? editorRef.current.getContent() : content
      
      await api("/policies", {
        method: "POST",
        body: JSON.stringify({
          key: selectedKey,
          title,
          content: finalContent
        })
      })
      
      toast.success("Policy updated successfully")
      fetchPolicies()
    } catch (err) {
      toast.error("Failed to save policy")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium">Loading policy editor...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Policy Management
            <Shield className="w-8 h-8 text-blue-600" />
          </h1>
          <p className="text-slate-500 font-medium">Manage your website's legal and operational policies.</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Changes
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Select Policy</p>
          {[
            { key: "terms-and-condition", label: "Terms & Conditions", icon: <FileText className="w-4 h-4" /> },
            { key: "privacy-policy", label: "Privacy Policy", icon: <Shield className="w-4 h-4" /> },
            { key: "refund-policy", label: "Refund Policy", icon: <History className="w-4 h-4" /> }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setSelectedKey(item.key)}
              className={`w-full text-left px-4 py-3.5 rounded-2xl font-bold flex items-center gap-3 transition-all ${
                selectedKey === item.key
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-100"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
            <div className="mb-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 px-1">Display Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none"
                placeholder="Enter policy title..."
              />
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200">
              <Editor
                apiKey="bxxmd7an995rn5hgs5his2zqc97326zka6mm3a55275iw9xe"
                onInit={(evt, editor) => editorRef.current = editor}
                initialValue={content}
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
                  content_style: 'body { font-family:Inter,Helvetica,Arial,sans-serif; font-size:14px }',
                  skin: 'oxide',
                  content_css: 'default'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
