'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { CreditCard, Check, X, User, Calendar, Clock } from 'lucide-react'

type Appointment = {
  id: string
  scheduled_at: string
  consultation_type: string
  payment_status: string
  consultation_fee: number
  profiles: { full_name: string } | null
}

export default function PaymentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

      const query = supabase
        .from('appointments')
        .select('*, profiles!appointments_patient_id_fkey(full_name)')
        .order('scheduled_at', { ascending: false })

      if (profile?.role === 'doctor') query.eq('doctor_id', user.id)
      else query.eq('patient_id', user.id)

      const { data } = await query
      if (data) setAppointments(data as Appointment[])
      setLoading(false)
    }
    fetch()
  }, [])

  const updatePayment = async (id: string, status: string) => {
    await supabase.from('appointments').update({ payment_status: status }).eq('id', id)
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, payment_status: status } : a))
  }

  const totalPending = appointments.filter(a => a.payment_status === 'pending').length
  const totalCompleted = appointments.filter(a => a.payment_status === 'completed').length
  const totalRevenue = appointments
    .filter(a => a.payment_status === 'completed')
    .reduce((sum, a) => sum + (a as any).consultation_fee, 0)

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 p-8">
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5 text-green-200" />
            <span className="text-green-200 text-sm font-medium">Payments</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Payments</h1>
          <p className="text-green-100/80">Track consultation payments</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">₹{totalRevenue}</p>
          <p className="text-xs text-gray-500 mt-1">Total Revenue</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-2xl font-bold text-green-600">{totalCompleted}</p>
          <p className="text-xs text-gray-500 mt-1">Paid</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-2xl font-bold text-yellow-600">{totalPending}</p>
          <p className="text-xs text-gray-500 mt-1">Pending</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Payment History</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : appointments.length === 0 ? (
            <div className="py-12 text-center">
              <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No payment records</p>
            </div>
          ) : (
            appointments.map(apt => (
              <div key={apt.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{apt.profiles?.full_name || 'Patient'}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(apt.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      <Clock className="w-3 h-3" />
                      <span className="capitalize">{apt.consultation_type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-lg ${
                    apt.payment_status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                    apt.payment_status === 'waived' ? 'bg-gray-50 text-gray-500 border border-gray-200' :
                    'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}>
                    {apt.payment_status === 'pending' ? 'Pending' : apt.payment_status === 'completed' ? 'Paid' : 'Waived'}
                  </span>
                  {apt.payment_status === 'pending' && (
                    <div className="flex gap-1">
                      <button onClick={() => updatePayment(apt.id, 'completed')} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition" title="Mark as paid">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => updatePayment(apt.id, 'waived')} className="p-1.5 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition" title="Waive">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
