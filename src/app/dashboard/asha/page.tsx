import { createClient } from '@/lib/supabase-server'
import { Users, Calendar, Phone, AlertCircle, Stethoscope, Activity, ChevronRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'

type AppointmentWithProfile = {
  id: string
  scheduled_at: string
  status: string
  asha_id: string | null
  profiles: { full_name: string | null; phone: string | null } | null
  doctor_profiles: { specialization: string } | null
}

export default async function AshaDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: patients } = await supabase
    .from('appointments')
    .select('*, profiles(full_name, phone)')
    .eq('asha_id', user.id)
    .limit(10)

  const { data: upcomingAppointments } = await supabase
    .from('appointments')
    .select('*, profiles(full_name), doctor_profiles(specialization)')
    .eq('asha_id', user.id)
    .eq('status', 'pending')
    .order('scheduled_at', { ascending: true })
    .limit(5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 p-8">
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="w-5 h-5 text-green-200" />
            <span className="text-green-200 text-sm font-medium">ASHA Worker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">ASHA Worker Dashboard</h1>
          <p className="text-green-100/80">Service Area: {profile?.phone || 'Not assigned'}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Assigned Patients" value={String(patients?.length || 0)} trend="+2 this month" color="blue" />
        <StatCard icon={Calendar} label="Upcoming Visits" value={String(upcomingAppointments?.length || 0)} trend="Next: Tomorrow" color="green" />
        <StatCard icon={Phone} label="Calls Made" value="12" trend="This week" color="purple" />
        <StatCard icon={AlertCircle} label="Alerts" value="2" trend="Needs attention" color="rose" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ActionCard
            href="/dashboard/asha/book"
            icon={Calendar}
            label="Book for Patient"
            desc="Schedule consultation"
            color="from-blue-500 to-cyan-500"
          />
          <ActionCard
            href="/dashboard/asha/patients"
            icon={Users}
            label="My Patients"
            desc="View patient list"
            color="from-green-500 to-emerald-500"
          />
          <ActionCard
            href="/dashboard/asha/reports"
            icon={Activity}
            label="Health Reports"
            desc="Monthly summaries"
            color="from-purple-500 to-pink-500"
          />
          <ActionCard
            href="/dashboard/messages"
            icon={Phone}
            label="Call Doctor"
            desc="Direct communication"
            color="from-orange-500 to-red-500"
          />
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
              <p className="text-sm text-gray-500">Scheduled consultations</p>
            </div>
          </div>
          <Link href="/dashboard/asha/patients" className="text-sm text-blue-600 font-medium hover:text-blue-700 transition">
            View all
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {upcomingAppointments && upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((apt: AppointmentWithProfile) => (
              <div key={apt.id} className="px-6 py-4 hover:bg-gray-50/50 transition group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center border border-green-100 shrink-0">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{apt.profiles?.full_name || 'Patient'}</p>
                      <p className="text-sm text-gray-500">{apt.doctor_profiles?.specialization}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-blue-400 rounded-full" />
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(apt.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No upcoming appointments</p>
              <p className="text-sm text-gray-400 mt-1">Schedule a consultation for a patient</p>
            </div>
          )}
        </div>
      </div>

      {/* Patient Alerts */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-red-50 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Patient Alerts</h2>
            <p className="text-sm text-gray-500">Items requiring your attention</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="p-4 bg-gradient-to-r from-red-50 to-red-50/50 border border-red-100 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-red-900">Follow-up Overdue</p>
                <p className="text-sm text-red-700">Patient Ramesh K. missed follow-up appointment (3 days ago)</p>
                <div className="flex gap-3 mt-3">
                  <button className="text-xs font-medium text-red-700 bg-red-100 px-3 py-1.5 rounded-lg hover:bg-red-200 transition">Contact</button>
                  <button className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition">Reschedule</button>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-red-300 shrink-0 mt-1" />
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-50/50 border border-yellow-100 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-yellow-900">Medication Reminder</p>
                <p className="text-sm text-yellow-700">Patient Sunita D. needs medication refill this week</p>
                <div className="flex gap-3 mt-3">
                  <button className="text-xs font-medium text-yellow-700 bg-yellow-100 px-3 py-1.5 rounded-lg hover:bg-yellow-200 transition">Notify</button>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-yellow-300 shrink-0 mt-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, trend, color }: {
  icon: any
  label: string
  value: string
  trend: string
  color: 'blue' | 'green' | 'purple' | 'rose'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    rose: 'bg-rose-50 text-rose-600',
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      <p className="text-xs text-gray-400 mt-1">{trend}</p>
    </div>
  )
}

function ActionCard({ href, icon: Icon, label, desc, color }: {
  href: string
  icon: any
  label: string
  desc: string
  color: string
}) {
  return (
    <Link
      href={href}
      className="group p-5 rounded-2xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-white transition-all hover:shadow-md"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} p-2.5 mb-4 shadow-md group-hover:shadow-lg transition-shadow`}>
        <Icon className="w-full h-full text-white" />
      </div>
      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{label}</h3>
      <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
    </Link>
  )
}
