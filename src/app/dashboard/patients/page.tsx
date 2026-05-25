'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Calendar, User, FileText, Video, CreditCard } from 'lucide-react'
import Link from 'next/link'

type Appointment = {
  id: string
  patient_id: string
  scheduled_at: string
  status: string
  consultation_type: string
  profiles: { full_name: string; phone: string | null } | null
}

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Appointment[]>([])
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchPatients = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('appointments')
        .select('*, profiles!appointments_patient_id_fkey(full_name, phone)')
        .eq('doctor_id', user.id)
        .in('status', ['confirmed', 'completed'])
        .order('scheduled_at', { ascending: false })

      if (data) setPatients(data as Appointment[])
      setLoading(false)
    }
    fetchPatients()
  }, [])

  const fetchRecords = async (patientId: string) => {
    setSelectedPatient(patientId)
    const { data } = await supabase
      .from('health_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
    if (data) setRecords(data)
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 p-8">
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-green-200" />
            <span className="text-green-200 text-sm font-medium">Patients</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">My Patients</h1>
          <p className="text-green-100/80">View patient health records during active consultations</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Patient List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Active & Recent Patients</h2>
            <p className="text-sm text-gray-500">{patients.length} patients</p>
          </div>
          <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : patients.length === 0 ? (
              <div className="py-12 text-center">
                <User className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No patients yet</p>
                <p className="text-sm text-gray-400 mt-1">Patients will appear when appointments are confirmed</p>
              </div>
            ) : (
              patients.map(apt => (
                <button
                  key={apt.id}
                  onClick={() => fetchRecords(apt.patient_id)}
                  className={`w-full px-6 py-4 text-left hover:bg-gray-50/50 transition flex items-center justify-between ${
                    selectedPatient === apt.patient_id ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center border border-blue-100">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{apt.profiles?.full_name || 'Unknown'}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(apt.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${
                          apt.status === 'confirmed' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                        }`}>{apt.status}</span>
                      </div>
                    </div>
                  </div>
                  <Video className="w-4 h-4 text-gray-300" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Health Records */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Health Records</h2>
              <p className="text-sm text-gray-500">
                {selectedPatient ? 'Showing records for selected patient' : 'Select a patient to view records'}
              </p>
            </div>
          </div>
          <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
            {!selectedPatient ? (
              <div className="py-16 text-center">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No patient selected</p>
                <p className="text-sm text-gray-400 mt-1">Click a patient from the list to view their records</p>
              </div>
            ) : records.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No health records found</p>
              </div>
            ) : (
              records.map(r => (
                <div key={r.id} className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{r.diagnosis}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {r.symptoms && r.symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {r.symptoms.map((s: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-50 text-xs text-gray-600 rounded-lg border border-gray-100">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                      {r.notes && (
                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">{r.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
