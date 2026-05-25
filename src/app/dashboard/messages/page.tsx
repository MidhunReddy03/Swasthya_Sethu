'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Send, Phone, Video, Paperclip, Check, CheckCheck, ChevronLeft, Calendar, User, Archive, MessageCircle, ArchiveRestore } from 'lucide-react'
import Link from 'next/link'

type Message = {
  id: string
  sender_id: string
  content: string
  created_at: string
  is_read: boolean
}

type Conversation = {
  id: string
  patient_id: string
  doctor_id: string
  scheduled_at: string
  patient_name: string
  doctor_name: string
  last_message?: string
  last_message_at?: string
  unread: number
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv, setActiveConv] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showMobileList, setShowMobileList] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const [archivedConvs, setArchivedConvs] = useState<Conversation[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUserId(user.id)

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      const role = profile?.role

      // Get active appointments (pending/confirmed)
      const { data: activeApts } = await supabase
        .from('appointments')
        .select('id, patient_id, doctor_id, scheduled_at, status')
        .or(`patient_id.eq.${user.id},doctor_id.eq.${user.id}`)
        .in('status', ['confirmed', 'pending'])
        .order('scheduled_at', { ascending: false })

      // Get archived appointments (completed)
      const { data: completedApts } = await supabase
        .from('appointments')
        .select('id, patient_id, doctor_id, scheduled_at, status')
        .or(`patient_id.eq.${user.id},doctor_id.eq.${user.id}`)
        .eq('status', 'completed')
        .order('scheduled_at', { ascending: false })

      const allApts = [...(activeApts || []), ...(completedApts || [])]

      if (allApts.length > 0) {
        const userIds = new Set<string>()
        allApts.forEach(a => { userIds.add(a.patient_id); userIds.add(a.doctor_id) })
        const { data: names } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', [...userIds])
        const nameMap = new Map(names?.map(n => [n.id, n.full_name]) || [])

        const mapConv = (a: any) => ({
          id: a.id,
          patient_id: a.patient_id,
          doctor_id: a.doctor_id,
          scheduled_at: a.scheduled_at,
          patient_name: nameMap.get(a.patient_id) || 'Patient',
          doctor_name: nameMap.get(a.doctor_id) || 'Doctor',
          unread: 0,
        })

        const active = (activeApts || []).map(mapConv)
        const archived = (completedApts || []).map(mapConv)

        setConversations(active)
        setArchivedConvs(archived)
        if (active.length > 0) {
          setActiveConv(active[0].id)
          setShowMobileList(false)
        }
      }
      // Fire-and-forget cleanup of messages older than 30 days
      ;(async () => {
        try { const { data } = await supabase.rpc('cleanup_old_messages'); if (data && data > 0) console.log(`Cleaned ${data} old messages`) } catch {}
      })()

      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (!activeConv) return
    fetchMessages(activeConv)

    const channel = supabase
      .channel(`messages-${activeConv}-${Date.now()}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `appointment_id=eq.${activeConv}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeConv])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMessages = async (appointmentId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConv) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('messages')
      .insert({ appointment_id: activeConv, sender_id: user.id, content: newMessage.trim() })
      .select()
      .single()

    if (data) {
      setMessages(prev => [...prev, data])
      setNewMessage('')
    }
  }

  const activeConversation = conversations.find(c => c.id === activeConv)
  const otherPartyName = activeConversation
    ? (currentUserId === activeConversation.patient_id ? activeConversation.doctor_name : activeConversation.patient_name)
    : ''

  if (loading) return (
    <div className="flex h-[calc(100vh-5rem)] bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="w-80 border-r p-4 space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl shimmer" />)}
      </div>
      <div className="flex-1 p-4"><div className="h-full rounded-xl shimmer" /></div>
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Conversation List */}
      <div className={`${showMobileList ? 'flex' : 'hidden'} md:flex w-full md:w-80 flex-col border-r border-gray-100 bg-gray-50/30`}>
        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-900">Messages</h2>
            <span className="text-xs text-gray-400">{showArchived ? archivedConvs.length : conversations.length}</span>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setShowArchived(false)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 ${
                !showArchived ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <MessageCircle className="w-3.5 h-3.5" /> Active
            </button>
            <button onClick={() => setShowArchived(true)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 ${
                showArchived ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <Archive className="w-3.5 h-3.5" /> Archived
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {(showArchived ? archivedConvs : conversations).length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <User className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">{showArchived ? 'No archived conversations' : 'No conversations yet'}</p>
              <p className="text-xs mt-1">{showArchived ? '' : 'Book a consultation to start chatting'}</p>
            </div>
          ) : (
            (showArchived ? archivedConvs : conversations).map(conv => {
              const isActive = conv.id === activeConv
              const name = currentUserId === conv.patient_id ? conv.doctor_name : conv.patient_name
              return (
                <button
                  key={conv.id}
                  onClick={() => { setActiveConv(conv.id); setShowMobileList(false) }}
                  className={`w-full px-4 py-3 text-left hover:bg-blue-50/30 transition flex items-center gap-3 border-b border-gray-50 ${
                    isActive ? 'bg-blue-50/50 border-l-2 border-l-blue-500' : ''
                  } ${showArchived ? 'opacity-60 hover:opacity-100' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                    showArchived
                      ? 'bg-gradient-to-br from-gray-400 to-gray-500'
                      : 'bg-gradient-to-br from-blue-500 to-blue-600'
                  }`}>
                    {name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      {showArchived ? <Archive className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                      {new Date(conv.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  {showArchived && (
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Archived</span>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${!showMobileList ? 'flex' : 'hidden'} md:flex flex-1 flex-col`}>
        {!activeConv ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Send className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">Select a conversation</p>
              <p className="text-sm mt-1">Choose a conversation from the left to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-5 py-3.5 border-b border-gray-100 bg-white flex items-center gap-3">
              <button onClick={() => setShowMobileList(true)} className="md:hidden p-1 -ml-1 text-gray-500">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {otherPartyName.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{otherPartyName}</h3>
                {showArchived ? (
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Archive className="w-3 h-3" />Archived</span>
                ) : (
                  <p className="text-xs text-green-500">Active</p>
                )}
              </div>
              <div className="flex gap-1">
                <Link href={activeConv ? `/dashboard/consultations/call/${activeConv}` : '#'} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition">
                  <Phone className="w-4 h-4" />
                </Link>
                <Link href={activeConv ? `/dashboard/consultations/call/${activeConv}` : '#'} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition">
                  <Video className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs mt-1">Start the conversation</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isOwn = msg.sender_id === currentUserId
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[75%]">
                        <div className={`px-4 py-2.5 text-sm leading-relaxed rounded-2xl ${
                          isOwn
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md'
                            : 'bg-gray-50 text-gray-900 rounded-bl-md border border-gray-100'
                        }`}>
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end pr-1' : 'justify-start pl-1'}`}>
                          <span className="text-[10px] text-gray-400">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isOwn && (msg.is_read ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3 text-gray-400" />)}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-5 py-3.5 border-t border-gray-100 bg-white">
              <div className="flex items-end gap-3">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition shrink-0">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
