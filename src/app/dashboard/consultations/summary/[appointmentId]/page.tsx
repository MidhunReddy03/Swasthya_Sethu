'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Star, Video, Phone, MessageSquare, Clock, CreditCard, Check, ArrowRight, Pill } from 'lucide-react'
import Link from 'next/link'

type AppointmentData = {
  id: string
  scheduled_at: string
  consultation_type: string
  status: string
  payment_status: string
  rating: number | null
  feedback: string | null
  patient_id: string
  doctor_id: string
}

export default function ConsultationSummaryPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = use(params)
  const [apt, setApt] = useState<AppointmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [role, setRole] = useState<'patient' | 'doctor'>('patient')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      setRole(profile?.role || 'patient')

      const { data } = await supabase.from('appointments').select('*').eq('id', appointmentId).single()
      if (data) {
        setApt(data as AppointmentData)
        if (data.rating) {
          setRating(data.rating)
          setFeedback(data.feedback || '')
          setSubmitted(true)
        }
      }
      setLoading(false)
    }
    fetch()
  }, [appointmentId])

  const submitReview = async () => {
    await supabase.from('appointments').update({ rating, feedback, status: 'completed' }).eq('id', appointmentId)
    setSubmitted(true)
  }

  const markPaid = async () => {
    await supabase.from('appointments').update({ payment_status: 'completed' }).eq('id', appointmentId)
    setApt(prev => prev ? { ...prev, payment_status: 'completed' } : null)
  }

  if (loading) return <div className="max-w-2xl mx-auto space-y-6"><div className="h-96 bg-white rounded-2xl shimmer" /></div>

  if (!apt) return <div className="text-center py-16 text-gray-500">Appointment not found</div>

  const TypeIcon = apt.consultation_type === 'video' ? Video : apt.consultation_type === 'audio' ? Phone : MessageSquare

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-8">
        <div className="relative">
          <h1 className="text-2xl font-bold text-white mb-1">Consultation Complete</h1>
          <p className="text-blue-100/80">
            {new Date(apt.scheduled_at).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <TypeIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 capitalize">{apt.consultation_type} Consultation</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <Clock className="w-4 h-4" />
              <span>{new Date(apt.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          <div className="ml-auto">
            <span className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize ${
              apt.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200' :
              'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>{apt.status}</span>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Payment</p>
                <p className={`text-xs ${apt.payment_status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {apt.payment_status === 'completed' ? 'Paid' : 'Pending'}
                </p>
              </div>
            </div>
            {role === 'doctor' && apt.payment_status === 'pending' && (
              <button onClick={markPaid}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition shadow-sm flex items-center gap-2">
                <Check className="w-4 h-4" /> Mark as Paid
              </button>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            {submitted ? 'Your Rating' : 'How was your consultation?'}
          </h3>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                disabled={submitted}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseOut={() => setHoverRating(0)}
                className={`p-1 transition-all ${submitted ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
              >
                <Star className={`w-8 h-8 ${
                  star <= (hoverRating || rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-200'
                }`} />
              </button>
            ))}
          </div>
          {!submitted && (
            <>
              <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                placeholder="Share your experience (optional)..."
                rows={3}
                className="w-full mt-4 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              <button onClick={submitReview} disabled={rating === 0}
                className="mt-3 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                Submit Feedback
              </button>
            </>
          )}
          {submitted && <p className="text-sm text-green-600 mt-2 flex items-center gap-1"><Check className="w-4 h-4" /> Thank you for your feedback!</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {role === 'doctor' && (
            <Link href={`/dashboard/prescriptions`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-blue-200 text-blue-700 text-sm font-medium rounded-xl hover:bg-blue-50 transition">
              <Pill className="w-4 h-4" /> Create Prescription
            </Link>
          )}
          <Link href="/dashboard" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition shadow-sm">
            Back to Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
