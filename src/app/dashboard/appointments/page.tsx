'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import Link from 'next/link'
import { Calendar, Clock, Video, Phone, MessageSquare, Check, X, ChevronRight, User, MapPin, CreditCard } from 'lucide-react'

type Appointment = {
  id: string
  scheduled_at: string
  status: string
  consultation_type: string
  payment_status: string
  notes: string | null
  profiles: { full_name: string; phone: string | null } | null
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending' | 'confirmed' | 'completed' | 'cancelled'>('pending')
  const [role, setRole] = useState<string>('patient')
  const supabase = createClient()

  useEffect(() => {
    fetchAppointments()
  }, [tab])

  const fetchAppointments = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    setRole(profile?.role || 'patient')

    const query = supabase
      .from('appointments')
      .select('*, profiles!appointments_patient_id_fkey(full_name, phone)')
      .order('scheduled_at', { ascending: false })

    if (profile?.role === 'doctor') query.eq('doctor_id', user.id)
    else query.eq('patient_id', user.id)

    if (tab === 'pending') query.eq('status', 'pending')
    else if (tab === 'confirmed') query.eq('status', 'confirmed')
    else if (tab === 'completed') query.eq('status', 'completed')
    else if (tab === 'cancelled') query.eq('status', 'cancelled')

    const { data } = await query
    if (data) setAppointments(data as Appointment[])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('appointments').update({ status }).eq('id', id)
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  const cancelAppointment = async (id: string) => {
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id)
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a))
  }

  const iconMap: Record<string, any> = {
    video: Video,
    audio: Phone,
    chat: MessageSquare,
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-8">
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-200" />
            <span className="text-blue-200 text-sm font-medium">Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">My Appointments</h1>
          <p className="text-blue-100/80">Manage and track your consultations</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 p-1.5 shadow-sm flex gap-1">
        {(['pending', 'confirmed', 'completed', 'cancelled'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all capitalize ${
              tab === t
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white rounded-2xl shimmer" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No {tab} appointments</p>
            <p className="text-sm text-gray-400 mt-1">
              {tab === 'pending' ? 'No upcoming appointments scheduled' : ''}
            </p>
          </div>
        ) : (
          appointments.map(apt => {
            const TypeIcon = iconMap[apt.consultation_type] || Video
            return (
              <div key={apt.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center shrink-0 border border-blue-100">
                        <User className="w-6 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{apt.profiles?.full_name || 'Patient'}</h3>
                        <p className="text-sm text-gray-500">{apt.profiles?.phone || 'No phone'}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(apt.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="flex items-center gap-1">
                            <TypeIcon className="w-3.5 h-3.5" />
                            <span className="capitalize">{apt.consultation_type}</span>
                          </div>
                        </div>
                        {apt.notes && (
                          <p className="text-xs text-gray-500 mt-2 italic">"{apt.notes}"</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {apt.payment_status === 'pending' && (
                        <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-lg border border-yellow-200">
                          Payment Pending
                        </span>
                      )}
                      {apt.payment_status === 'completed' && (
                        <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-lg border border-green-200">
                          Paid
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize ${
                        apt.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                        apt.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        apt.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {apt.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {apt.status === 'pending' && role === 'doctor' && (
                        <>
                          <button
                            onClick={() => updateStatus(apt.id, 'confirmed')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition shadow-sm"
                          >
                            <Check className="w-4 h-4" />
                            Accept
                          </button>
                          <button
                            onClick={() => updateStatus(apt.id, 'cancelled')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-white text-red-600 border border-red-200 text-sm font-medium rounded-xl hover:bg-red-50 transition"
                          >
                            <X className="w-4 h-4" />
                            Decline
                          </button>
                        </>
                      )}
                      {apt.status === 'pending' && role === 'patient' && (
                        <button
                          onClick={() => cancelAppointment(apt.id)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-white text-red-600 border border-red-200 text-sm font-medium rounded-xl hover:bg-red-50 transition"
                        >
                          <X className="w-4 h-4" />
                          Cancel Request
                        </button>
                      )}
                      {apt.status === 'confirmed' && role === 'doctor' && (
                        <Link
                          href={apt.consultation_type === 'chat' ? `/dashboard/messages` : `/dashboard/consultations/call/${apt.id}`}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition shadow-sm"
                        >
                          <Video className="w-4 h-4" />
                          Start {apt.consultation_type === 'chat' ? 'Chat' : 'Call'}
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      )}
                      {apt.status === 'confirmed' && role === 'patient' && (
                        <button
                          onClick={() => cancelAppointment(apt.id)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-white text-red-600 border border-red-200 text-sm font-medium rounded-xl hover:bg-red-50 transition"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      )}
                      {apt.status === 'completed' && role === 'doctor' && (
                        <button
                          onClick={() => updateStatus(apt.id, 'confirmed')}
                          className="text-sm text-blue-600 font-medium hover:text-blue-700 transition"
                        >
                          Reopen
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
