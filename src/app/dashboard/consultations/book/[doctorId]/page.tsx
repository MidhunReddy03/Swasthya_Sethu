'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Calendar, Clock, Video, Check, ArrowLeft, ArrowRight, Phone, MessageSquare, Sparkles, Star, MapPin } from 'lucide-react'
import SymptomTriage from '@/components/SymptomTriage'

type Step = 'symptoms' | 'type' | 'schedule' | 'confirm'

type DoctorInfo = {
  id: string
  specialization: string
  experience_years: number
  consultation_fee: number
  hospital: string | null
  degree: string | null
  qualification: string | null
  rating: number
  bio: string | null
  languages_spoken: string[]
  profiles: { full_name: string } | null
}

export default function BookConsultationPage({ params }: { params: Promise<{ doctorId: string }> }) {
  const { doctorId } = use(params)
  const [doctor, setDoctor] = useState<DoctorInfo | null>(null)
  const [step, setStep] = useState<Step>('symptoms')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [consultationType, setConsultationType] = useState<'video' | 'audio' | 'chat'>('video')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [urgency, setUrgency] = useState<string>('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchDoctor = async () => {
      const { data } = await supabase
        .from('doctor_profiles')
        .select('*, profiles(full_name)')
        .eq('id', doctorId)
        .single()
      if (data) setDoctor(data as DoctorInfo)
    }
    fetchDoctor()
  }, [doctorId])

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ]

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) return
    
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`)

    const { data: apt, error } = await supabase.from('appointments').insert({
      patient_id: user?.id,
      doctor_id: doctorId,
      scheduled_at: scheduledAt.toISOString(),
      consultation_type: consultationType,
      status: 'pending',
    }).select()

    setLoading(false)
    if (!error && apt) {
      await supabase.from('notifications').insert({
        user_id: doctorId,
        title: 'New Appointment Booking',
        message: `${doctor?.profiles?.full_name || 'A patient'} booked a ${consultationType} consultation on ${new Date(scheduledAt).toLocaleDateString('en-IN')} at ${selectedTime}`,
        type: 'appointment',
        related_id: apt[0]?.id || null,
      })
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center animate-scale-in">
        <div className="text-center max-w-sm mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200/50">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">Your consultation has been scheduled successfully.</p>
          <div className="animate-pulse-soft text-sm text-gray-400">Redirecting to dashboard...</div>
        </div>
      </div>
    )
  }

  const steps = [
    { key: 'symptoms', label: 'Symptoms', icon: Sparkles },
    { key: 'type', label: 'Type', icon: Video },
    { key: 'schedule', label: 'Schedule', icon: Calendar },
    { key: 'confirm', label: 'Confirm', icon: Check },
  ]

  const currentStepIndex = steps.findIndex(s => s.key === step)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Doctor Info Card */}
      {doctor && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-blue-200/50 shrink-0">
              {doctor.profiles?.full_name?.charAt(0) || 'D'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 text-lg truncate">{doctor.profiles?.full_name}</h2>
              <p className="text-sm text-blue-600 font-medium">{doctor.specialization}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                {doctor.degree && <span>{doctor.degree}</span>}
                {doctor.experience_years > 0 && <span>{doctor.experience_years} yrs exp.</span>}
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{doctor.rating}</span>
                </div>
              </div>
              {doctor.hospital && (
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                  <MapPin className="w-3 h-3" />
                  <span>{doctor.hospital}</span>
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-bold text-gray-900">₹{doctor.consultation_fee}</p>
              <p className="text-xs text-gray-500">/ session</p>
            </div>
          </div>
          {doctor.qualification && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-yellow-700 bg-yellow-50 w-fit px-2.5 py-1 rounded-lg">
              <Star className="w-3 h-3" />
              <span>{doctor.qualification}</span>
            </div>
          )}
        </div>
      )}

      {/* Progress Steps */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                i <= currentStepIndex
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md shadow-blue-200/50'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className={`text-sm font-medium hidden sm:block ${
                i <= currentStepIndex ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className={`hidden sm:block w-12 h-0.5 mx-2 rounded ${
                  i < currentStepIndex ? 'bg-blue-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-fade-in">
        {step === 'symptoms' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Describe your symptoms</h2>
              <p className="text-gray-600 text-sm mt-1">This helps us match you with the right specialist.</p>
            </div>
            <SymptomTriage onTriageComplete={(urgency) => setUrgency(urgency)} />
            <button
              onClick={() => setStep('type')}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'type' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Choose consultation type</h2>
              <p className="text-gray-600 text-sm mt-1">Select how you'd like to connect with the doctor.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { value: 'video', label: 'Video Call', icon: Video, desc: 'Face-to-face consultation', color: 'from-blue-500 to-cyan-500' },
                { value: 'audio', label: 'Audio Call', icon: Phone, desc: 'Talk on phone (low data)', color: 'from-green-500 to-emerald-500' },
                { value: 'chat', label: 'Chat', icon: MessageSquare, desc: 'Text-based consultation', color: 'from-purple-500 to-pink-500' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => { setConsultationType(type.value as any); setStep('schedule') }}
                  className={`group p-5 rounded-2xl border-2 transition-all text-left ${
                    consultationType === type.value
                      ? 'border-blue-500 bg-blue-50/50 shadow-md shadow-blue-200/20'
                      : 'border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} p-2.5 mb-4 shadow-md group-hover:shadow-lg transition-shadow`}>
                    <type.icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{type.label}</h3>
                  <p className="text-sm text-gray-500 mt-1">{type.desc}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep('symptoms')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
        )}

        {step === 'schedule' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Pick a date & time</h2>
              <p className="text-gray-600 text-sm mt-1">
                {consultationType === 'video' ? 'Video' : consultationType === 'audio' ? 'Audio' : 'Chat'} consultation
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Time</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2.5 text-sm font-medium rounded-xl border transition-all ${
                      selectedTime === time
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Describe your symptoms or any additional information..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none text-sm"
              />
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep('type')}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep('confirm')}
                disabled={!selectedDate || !selectedTime}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                Review Booking <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-6 animate-scale-in">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Confirm your booking</h2>
              <p className="text-gray-600 text-sm mt-1">Review your consultation details below.</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 space-y-4 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-semibold text-gray-900">
                    {selectedDate && new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    {' • '}
                    {selectedTime}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Consultation Type</p>
                  <p className="font-semibold text-gray-900 capitalize">{consultationType} Call</p>
                </div>
              </div>
              {urgency && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Urgency Level</p>
                    <p className="font-semibold text-gray-900 capitalize">{urgency}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep('schedule')}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleBooking}
                disabled={loading}
                className="btn-primary flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200/50 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Booking...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
