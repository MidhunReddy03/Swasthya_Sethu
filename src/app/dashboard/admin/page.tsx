'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Shield, Users, Calendar, CreditCard, Activity, TrendingUp, UserCheck } from 'lucide-react'
import Link from 'next/link'

export default function AdminPanelPage() {
  const [stats, setStats] = useState({ users: 0, doctors: 0, appointments: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      const { count: totalDoctors } = await supabase.from('doctor_profiles').select('*', { count: 'exact', head: true })
      const { count: totalAppts } = await supabase.from('appointments').select('*', { count: 'exact', head: true })

      const { data: paidAppts } = await supabase.from('appointments').select('payment_status').eq('payment_status', 'completed')
      const paidCount = paidAppts?.length || 0

      setStats({
        users: totalUsers || 0,
        doctors: totalDoctors || 0,
        appointments: totalAppts || 0,
        revenue: paidCount * 499,
      })
      setLoading(false)
    }
    init()
  }, [])

  if (loading) return <div className="space-y-6"><div className="h-48 bg-white rounded-2xl shimmer" /><div className="h-64 bg-white rounded-2xl shimmer" /></div>

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-8">
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-purple-200" />
            <span className="text-purple-200 text-sm font-medium">Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Admin Panel</h1>
          <p className="text-purple-100/80">Platform overview and management</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminCard icon={Users} label="Total Users" value={stats.users} color="from-blue-500 to-cyan-500" />
        <AdminCard icon={UserCheck} label="Doctors" value={stats.doctors} color="from-green-500 to-emerald-500" />
        <AdminCard icon={Calendar} label="Appointments" value={stats.appointments} color="from-purple-500 to-pink-500" />
        <AdminCard icon={CreditCard} label="Revenue" value={`₹${stats.revenue}`} color="from-orange-500 to-red-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-purple-500" /> Recent Activity</h2>
          <div className="space-y-4">
            {['New doctor registration', 'Appointment completed', 'Payment received', 'New patient signup'].map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="text-sm text-gray-700">{a}</span>
                <span className="text-xs text-gray-400 ml-auto">Today</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-500" /> Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard/consultations" className="p-4 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition text-center">Manage Doctors</Link>
            <Link href="/dashboard/appointments" className="p-4 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition text-center">All Appointments</Link>
            <Link href="/dashboard/payments" className="p-4 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition text-center">Transactions</Link>
            <button className="p-4 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition text-center">Export Data</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  )
}
