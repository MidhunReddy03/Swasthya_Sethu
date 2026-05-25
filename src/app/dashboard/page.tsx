'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Calendar, Video, FileText, Clock, Heart, ArrowRight, Users, Sparkles, Activity, CreditCard, Stethoscope, ToggleLeft, ToggleRight, Shield } from 'lucide-react'
import Link from 'next/link'
import SymptomTriage from '@/components/SymptomTriage'

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [doctorProfile, setDoctorProfile] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)

      if (p?.role === 'doctor') {
        const { data: dp } = await supabase.from('doctor_profiles').select('*').eq('id', user.id).single()
        setDoctorProfile(dp)
      }

      const { data: apts } = await supabase
        .from('appointments')
        .select('*, profiles!appointments_patient_id_fkey(full_name)')
        .or(`patient_id.eq.${user.id},doctor_id.eq.${user.id}`)
        .order('scheduled_at', { ascending: true })
        .limit(5)
      if (apts) setAppointments(apts)
      setLoading(false)
    }
    init()
  }, [])

  if (loading) return (
    <div className="space-y-6">
      <div className="h-48 bg-white rounded-2xl shimmer" />
      <div className="h-32 bg-white rounded-2xl shimmer" />
    </div>
  )

  const isDoctor = profile?.role === 'doctor'
  const isAdmin = profile?.role === 'admin'
  const toggleAvailability = async () => {
    if (!doctorProfile) return
    const newVal = !doctorProfile.is_available
    await supabase.from('doctor_profiles').update({ is_available: newVal }).eq('id', profile?.id)
    setDoctorProfile((prev: any) => ({ ...prev, is_available: newVal }))
  }
  const pendingCount = appointments.filter((a: any) => a.status === 'pending').length
  const confirmedCount = appointments.filter((a: any) => a.status === 'confirmed').length
  const completedCount = appointments.filter((a: any) => a.status === 'completed').length

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-8">
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-6 h-6 text-pink-300" />
            <span className="text-blue-200 text-sm font-medium">
              {isDoctor ? 'Doctor Dashboard' : 'Patient Dashboard'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-blue-100/80 max-w-xl">
            {isDoctor
              ? 'Manage your appointments, patients, and practice from here.'
              : 'Here\'s your health overview for today.'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isDoctor ? (
          <>
            <StatCard icon={Calendar} label="Pending" value={String(pendingCount)} color="yellow" />
            <StatCard icon={Video} label="Confirmed" value={String(confirmedCount)} color="blue" />
            <StatCard icon={FileText} label="Completed" value={String(completedCount)} color="green" />
            <StatCard icon={CreditCard} label="Revenue" value={`₹${completedCount * 499}`} color="purple" />
          </>
        ) : (
          <>
            <StatCard icon={Calendar} label="Upcoming" value={String(pendingCount)} color="blue" />
            <StatCard icon={FileText} label="Completed" value={String(completedCount)} color="green" />
            <StatCard icon={Activity} label="Prescriptions" value="0" color="purple" />
            <StatCard icon={Heart} label="Last Visit" value="Today" color="rose" />
          </>
        )}
      </div>

      {/* Availability Toggle for Doctors */}
      {isDoctor && doctorProfile && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${doctorProfile.is_available ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              {doctorProfile.is_available ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{doctorProfile.is_available ? 'You are Available' : 'You are Unavailable'}</p>
              <p className="text-xs text-gray-500">Patients can {doctorProfile.is_available ? 'see and book' : 'not see'} you</p>
            </div>
          </div>
          <button onClick={toggleAvailability}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${doctorProfile.is_available ? 'bg-green-500' : 'bg-gray-300'}`}>
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${doctorProfile.is_available ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {isAdmin ? (
                <>
                  <ActionCard icon={Users} label="Users" href="/dashboard/admin" color="from-blue-500 to-cyan-500" />
                  <ActionCard icon={Calendar} label="All Appts" href="/dashboard/admin" color="from-green-500 to-emerald-500" />
                  <ActionCard icon={CreditCard} label="Revenue" href="/dashboard/admin" color="from-purple-500 to-pink-500" />
                  <ActionCard icon={Shield} label="Settings" href="/dashboard/admin" color="from-orange-500 to-red-500" />
                </>
              ) : isDoctor ? (
                <>
                  <ActionCard icon={Video} label="Appointments" href="/dashboard/appointments" color="from-blue-500 to-cyan-500" />
                  <ActionCard icon={Users} label="My Patients" href="/dashboard/patients" color="from-green-500 to-emerald-500" />
                  <ActionCard icon={CreditCard} label="Payments" href="/dashboard/payments" color="from-purple-500 to-pink-500" />
                  <ActionCard icon={Stethoscope} label="Prescriptions" href="/dashboard/prescriptions" color="from-orange-500 to-red-500" />
                </>
              ) : (
                <>
                  <ActionCard icon={Video} label="Find Doctor" href="/dashboard/consultations" color="from-blue-500 to-cyan-500" />
                  <ActionCard icon={Calendar} label="Appointments" href="/dashboard/appointments" color="from-green-500 to-emerald-500" />
                  <ActionCard icon={FileText} label="Records" href="/dashboard/records" color="from-purple-500 to-pink-500" />
                  <ActionCard icon={Clock} label="Messages" href="/dashboard/messages" color="from-orange-500 to-red-500" />
                </>
              )}
            </div>
          </div>

          {/* Appointments List */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-500" />
                {isDoctor ? 'Recent Appointments' : 'Your Appointments'}
              </h2>
              <Link href="/dashboard/appointments" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {appointments.length > 0 ? (
                appointments.map((apt: any) => {
                  const displayName = isDoctor
                    ? apt.profiles?.full_name || 'Patient'
                    : apt.profiles?.full_name || 'Consultation'
                  return (
                    <div key={apt.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{displayName}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(apt.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              <span className="mx-1">•</span>
                              {new Date(apt.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                          apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          apt.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>{apt.status}</span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-12 text-center">
                  <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No appointments yet</p>
                  {!isDoctor && (
                    <Link href="/dashboard/consultations" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all shadow-md">
                      Find a Doctor <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {!isDoctor && (
            <>
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-white" />
                    <h3 className="font-semibold text-white">AI Symptom Checker</h3>
                  </div>
                  <p className="text-sm text-blue-100 mt-1">Get instant AI assessment</p>
                </div>
                <SymptomTriage />
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Stay Healthy</h3>
                    <p className="text-sm text-gray-600 mt-1">Drink 8 glasses of water daily and take a 15-minute walk to boost immunity.</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600', yellow: 'bg-yellow-50 text-yellow-600',
    rose: 'bg-rose-50 text-rose-600',
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colors[color] || colors.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

function ActionCard({ icon: Icon, label, href, color }: { icon: any; label: string; href: string; color: string }) {
  return (
    <Link href={href} className="group p-4 rounded-xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 transition-all text-center">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} p-2.5 mx-auto mb-3 shadow-md group-hover:shadow-lg transition-shadow`}>
        <Icon className="w-full h-full text-white" />
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </Link>
  )
}
