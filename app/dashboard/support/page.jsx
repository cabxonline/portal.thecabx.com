"use client"

import { useEffect, useState, useRef } from "react"
import { api } from "@/lib/api"
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Headphones,
  ArrowLeft,
  ShieldCheck,
  Search,
  Filter,
  Phone,
  Mail,
  UserCheck
} from "lucide-react"
import { toast } from "sonner"
import { Editor } from "@tinymce/tinymce-react"

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [replyMessage, setReplyMessage] = useState("")
  
  const editorRef = useRef(null)

  useEffect(() => {
    fetchTickets()
  }, [])

  async function fetchTickets() {
    try {
      setLoading(true)
      const data = await api("/support")
      setTickets(data)
    } catch (err) {
      toast.error("Failed to load tickets")
    } finally {
      setLoading(false)
    }
  }

  async function handleSendReply() {
    if (!selectedTicket || !replyMessage) return
    try {
      setSending(true)
      const data = await api(`/support/${selectedTicket.id}/reply`, {
        method: "POST",
        body: JSON.stringify({ message: replyMessage, isAdmin: true })
      })
      
      // Update local state
      const updatedTicket = { ...selectedTicket }
      updatedTicket.replies = [...updatedTicket.replies, data]
      updatedTicket.status = "in_progress"
      setSelectedTicket(updatedTicket)
      setReplyMessage("")
      if (editorRef.current) editorRef.current.setContent("")
      
      // Update ticket list
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t))
      
      toast.success("Reply sent to customer")
    } catch (err) {
      toast.error("Failed to send reply")
    } finally {
      setSending(false)
    }
  }

  async function handleCloseTicket() {
    if (!selectedTicket) return
    try {
      setSending(true)
      await api(`/support/${selectedTicket.id}/close`, {
        method: "PATCH"
      })
      
      const updatedTicket = { ...selectedTicket, status: "closed" }
      setSelectedTicket(updatedTicket)
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t))
      
      toast.success("Ticket closed")
    } catch (err) {
      toast.error("Failed to close ticket")
    } finally {
      setSending(false)
    }
  }

  const getStatusStyle = (status) => {
    switch(status) {
      case 'open': return 'bg-blue-100 text-blue-700'
      case 'in_progress': return 'bg-amber-100 text-amber-700'
      case 'closed': return 'bg-emerald-100 text-emerald-700'
      default: return 'bg-slate-100 text-slate-600'
    }
  }

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || t.ticketId.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || t.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] overflow-hidden bg-slate-50 border border-slate-200 rounded-[2.5rem] shadow-sm">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Support Management</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Support Tickets</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search ticket ID or subject..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-50 focus:border-blue-500 outline-none w-64 transition-all"
            />
          </div>
          <select 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-50 focus:border-blue-500 outline-none appearance-none"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Ticket List Sidebar */}
        <div className="w-96 border-r border-slate-200 bg-white overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">Loading Tickets</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageSquare className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-sm font-bold text-slate-400 tracking-tight">No tickets found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredTickets.map(ticket => (
                <button 
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full p-6 text-left transition-all hover:bg-slate-50 ${selectedTicket?.id === ticket.id ? 'bg-blue-50/50 border-l-4 border-blue-600 shadow-inner' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${getStatusStyle(ticket.status)}`}>
                      {ticket.status.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-black text-slate-900 text-sm mb-1 truncate">{ticket.subject}</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-100 rounded-full flex items-center justify-center text-[8px] font-black text-slate-400">
                      {ticket.user?.name?.[0] || "U"}
                    </div>
                    <p className="text-slate-500 text-xs font-bold truncate">{ticket.user?.name || "Customer"}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Conversation Area */}
        <div className="flex-1 bg-slate-50 relative flex flex-col overflow-hidden">
          {selectedTicket ? (
            <div className="flex-1 flex flex-col h-full animate-in fade-in duration-300">
              {/* Header */}
              <div className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg tracking-tight">{selectedTicket.subject}</h3>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                      <span className="text-blue-600">ID: #{selectedTicket.ticketId}</span>
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {selectedTicket.user?.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {selectedTicket.user?.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {selectedTicket.status !== 'closed' && (
                    <button 
                      onClick={handleCloseTicket}
                      disabled={sending}
                      className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Close Ticket
                    </button>
                  )}
                  <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${getStatusStyle(selectedTicket.status)}`}>
                    {selectedTicket.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                {selectedTicket.replies?.map((reply) => (
                  <div key={reply.id} className={`flex ${reply.isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] flex gap-4 ${reply.isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${reply.isAdmin ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'}`}>
                        {reply.isAdmin ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div className="space-y-2">
                        <div className={`p-6 rounded-[2rem] shadow-sm ${
                          reply.isAdmin 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white border border-slate-200 text-slate-700'
                        }`}>
                          <div 
                            className={`prose prose-sm max-w-none ${reply.isAdmin ? 'prose-invert' : 'prose-slate'} [&_p]:mb-0`}
                            dangerouslySetInnerHTML={{ __html: reply.message }}
                          />
                        </div>
                        <div className={`flex items-center gap-2 ${reply.isAdmin ? 'justify-end' : ''}`}>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                            {reply.isAdmin ? "Agent (You)" : selectedTicket.user?.name}
                          </p>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                            {new Date(reply.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Area */}
              <div className="p-8 bg-white border-t border-slate-200 shrink-0">
                {selectedTicket.status === 'closed' ? (
                  <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex items-center justify-center gap-4 text-emerald-700">
                    <CheckCircle2 className="w-6 h-6" />
                    <div>
                      <p className="font-black">Ticket Resolved</p>
                      <p className="text-sm font-medium opacity-80">This conversation has been closed. Re-open if necessary.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="rounded-[2rem] overflow-hidden border border-slate-200 focus-within:ring-8 focus-within:ring-blue-50 focus-within:border-blue-600 transition-all shadow-sm">
                      <Editor
                        apiKey="bxxmd7an995rn5hgs5his2zqc97326zka6mm3a55275iw9xe"
                        onInit={(evt, editor) => editorRef.current = editor}
                        initialValue=""
                        onEditorChange={(content) => setReplyMessage(content)}
                        init={{
                          height: 300,
                          menubar: true,
                          plugins: ['advlist', 'autolink', 'lists', 'link', 'charmap', 'preview', 'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'],
                          toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                          content_style: 'body { font-family:Inter,Helvetica,Arial,sans-serif; font-size:14px }',
                          placeholder: "Type your official response here...",
                          branding: false,
                          promotion: false
                        }}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button 
                        onClick={handleSendReply}
                        disabled={sending || !replyMessage}
                        className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
                      >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        Send Official Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center mb-8 border border-slate-100">
                <ShieldCheck className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Select a Ticket to Manage</h2>
              <p className="text-slate-500 font-medium max-w-md mx-auto mb-10 leading-relaxed">
                Choose a customer support ticket from the list on the left to view the full conversation and provide assistance.
              </p>
              
              <div className="grid grid-cols-2 gap-6 max-w-md w-full">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mb-1">{tickets.filter(t => t.status === 'open').length}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Requests</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-3">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mb-1">{tickets.filter(t => t.status === 'in_progress').length}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Discussion</p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
