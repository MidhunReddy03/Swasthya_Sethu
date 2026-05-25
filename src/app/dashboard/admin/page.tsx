'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Shield, Users, Calendar, CreditCard, Activity, TrendingUp, UserCheck, ClipboardList, Search, Download, RefreshCw } from 'lucide-react'
import Link from 'next/link'

type AuditEntry = {
  id: string
  table_name: string
  record_id: string
  action: string
  old_data: any
  new_data: any
  user_id: string
  user_role: string | null
  created_at: string
}

export default function AdminPanelPage() {
  const [stats, setStats] = useState({ users: 0, doctors: 0, appointments: 0, revenue: 0 })
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'audit'>('overview')
  const [auditSearch, setAuditSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    init()
  }, [])

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

  const loadAuditLog = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    if (data) setAuditLog(data as AuditEntry[])
    setLoading(false)
  }

  useEffect(() => {
    if (tab === 'audit') loadAuditLog()
  }, [tab])

  const filteredLog = auditLog.filter(e =>
    e.table_name.toLowerCase().includes(auditSearch.toLowerCase()) ||
    e.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
    (e.user_role || '').toLowerCase().includes(auditSearch.toLowerCase())
  )

  const actionColors: Record<string, string> = {
    INSERT: 'bg-green-100 text-green-700',
    UPDATE: 'bg-blue-100 text-blue-700',
    DELETE: 'bg-red-100 text-red-700',
  }

  if (loading && tab === 'overview') return <div className="space-y-6"><div className="h-48 bg-white rounded-2xl shimmer" /><div className="h-64 bg-white rounded-2xl shimmer" /></div>

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-8">
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-purple-200" />
            <span className="text-purple-200 text-sm font-medium">Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Admin Panel</h1>
          <p className="text-purple-100/80">Platform overview, audit logs, and management</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 p-1.5 shadow-sm flex gap-1">
        {(['overview', 'audit'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all capitalize flex items-center justify-center gap-2 ${
              tab === t ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}>
            {t === 'overview' ? <Activity className="w-4 h-4" /> : <ClipboardList className="w-4 h-4" />}
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AdminCard icon={Users} label="Total Users" value={stats.users} color="from-blue-500 to-cyan-500" />
            <AdminCard icon={UserCheck} label="Doctors" value={stats.doctors} color="from-green-500 to-emerald-500" />
            <AdminCard icon={Calendar} label="Appointments" value={stats.appointments} color="from-purple-500 to-pink-500" />
            <AdminCard icon={CreditCard} label="Revenue" value={`₹${stats.revenue}`} color="from-orange-500 to-red-500" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-purple-500" /> Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-sm text-gray-500">Total Users</span><span className="text-sm font-semibold">{stats.users}</span></div>
                <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-sm text-gray-500">Registered Doctors</span><span className="text-sm font-semibold">{stats.doctors}</span></div>
                <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-sm text-gray-500">Total Appointments</span><span className="text-sm font-semibold">{stats.appointments}</span></div>
                <div className="flex justify-between py-2"><span className="text-sm text-gray-500">Revenue (completed)</span><span className="text-sm font-semibold">₹{stats.revenue}</span></div>
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
        </>
      ) : (
        /* Audit Log Tab */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-purple-600" />
              <h2 className="font-semibold text-gray-900">Audit Log</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{auditLog.length} entries</span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Filter..."
                  value={auditSearch} onChange={e => setAuditSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-full sm:w-48" />
              </div>
              <button onClick={loadAuditLog} className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="text-left py-3 px-5 text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-gray-500 uppercase">Table</th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-gray-500 uppercase">Record ID</th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-gray-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={6} className="py-12 text-center text-gray-400">Loading...</td></tr>
                ) : filteredLog.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-gray-400">No audit entries found</td></tr>
                ) : (
                  filteredLog.map(entry => (
                    <tr key={entry.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3 px-5 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(entry.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-5 font-medium text-gray-700 text-xs">{entry.table_name}</td>
                      <td className="py-3 px-5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${actionColors[entry.action] || 'bg-gray-100 text-gray-700'}`}>
                          {entry.action}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-xs text-gray-500">{entry.user_role || 'system'}</td>
                      <td className="py-3 px-5 text-xs text-gray-400 font-mono">{entry.record_id.slice(0, 8)}...</td>
                      <td className="py-3 px-5 text-xs text-gray-500">
                        {entry.action === 'INSERT' && <span className="text-green-600">Created</span>}
                        {entry.action === 'DELETE' && <span className="text-red-600">Deleted</span>}
                        {entry.action === 'UPDATE' && (
                          <span className="text-blue-600">
                            {entry.new_data ? Object.keys(entry.new_data).filter(k => entry.old_data?.[k] !== entry.new_data?.[k]).slice(0, 3).join(', ') : 'Updated'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
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
