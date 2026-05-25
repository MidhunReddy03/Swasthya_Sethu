'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Pill, Plus, Trash2, Printer, FileText, Calendar, User, Check, ChevronDown, Search } from 'lucide-react'

type Appointment = {
  id: string
  patient_id: string
  patient_name: string
  scheduled_at: string
  diagnosis?: string
}

type Medicine = {
  id: string
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

type Prescription = {
  id: string
  created_at: string
  advice: string | null
  follow_up_date: string | null
  medicines: Medicine[]
  profiles: { full_name: string } | null
}

export default function PrescriptionsPage() {
  const [step, setStep] = useState<'select' | 'create' | 'history'>('select')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null)
  const [medicines, setMedicines] = useState<Medicine[]>([
    { id: '1', name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ])
  const [advice, setAdvice] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch confirmed appointments with patient names
      const { data: apts } = await supabase
        .from('appointments')
        .select('id, patient_id, scheduled_at')
        .eq('doctor_id', user.id)
        .in('status', ['confirmed', 'completed'])

      if (apts && apts.length > 0) {
        const pIds = [...new Set(apts.map(a => a.patient_id))]
        const { data: names } = await supabase.from('profiles').select('id, full_name').in('id', pIds)
        const nameMap = new Map(names?.map(n => [n.id, n.full_name]) || [])
        setAppointments(apts.map(a => ({
          ...a,
          patient_name: nameMap.get(a.patient_id) || 'Patient',
        })))
      }

      // Fetch existing prescriptions
      const { data: rx } = await supabase
        .from('prescriptions')
        .select('*, profiles(full_name)')
        .eq('doctor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      if (rx) setPrescriptions(rx as Prescription[])
    }
    init()
  }, [])

  const addMedicine = () => {
    setMedicines([...medicines, { id: Date.now().toString(), name: '', dosage: '', frequency: '', duration: '', instructions: '' }])
  }

  const removeMedicine = (id: string) => {
    if (medicines.length > 1) setMedicines(medicines.filter(m => m.id !== id))
  }

  const updateMedicine = (id: string, field: keyof Medicine, value: string) => {
    setMedicines(medicines.map(m => m.id === id ? { ...m, [field]: value } : m))
  }

  const handleSave = async () => {
    if (!selectedApt || medicines.every(m => !m.name)) return
    setSaving(true)

    // Create health record first
    const { data: record } = await supabase.from('health_records').insert({
      patient_id: selectedApt.patient_id,
      doctor_id: (await supabase.auth.getUser()).data.user?.id,
      diagnosis: diagnosis || 'Consultation',
      symptoms: [],
      notes: advice,
    }).select().single()

    if (record) {
      // Create prescription with medicines
      await supabase.from('prescriptions').insert({
        record_id: record.id,
        doctor_id: (await supabase.auth.getUser()).data.user?.id,
        patient_id: selectedApt.patient_id,
        medicines: medicines.filter(m => m.name),
        advice,
        follow_up_date: followUpDate || null,
      })

      setSuccess(true)
      setMedicines([{ id: '1', name: '', dosage: '', frequency: '', duration: '', instructions: '' }])
      setAdvice('')
      setDiagnosis('')
      setFollowUpDate('')
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  const handlePrint = () => window.print()

  const filteredAppointments = appointments.filter(a =>
    a.patient_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 p-8">
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Pill className="w-5 h-5 text-green-200" />
            <span className="text-green-200 text-sm font-medium">Prescriptions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Prescriptions</h1>
          <p className="text-green-100/80">Create and manage patient prescriptions</p>
        </div>
      </div>

      {/* Success Toast */}
      {success && (
        <div className="fixed top-6 right-6 z-50 bg-green-50 border border-green-200 text-green-800 px-5 py-3.5 rounded-2xl shadow-lg animate-slide-up flex items-center gap-3">
          <Check className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium">Prescription saved successfully!</span>
        </div>
      )}

      {step === 'select' && (
        <>
          {/* Select Patient */}
          {appointments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No patients available</p>
              <p className="text-sm text-gray-400 mt-1">Confirm appointments first to create prescriptions</p>
              <button onClick={() => setStep('history')} className="mt-4 px-5 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition">
                View Past Prescriptions
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <h2 className="font-semibold text-gray-900">Select a Patient</h2>
                <p className="text-sm text-gray-500">Choose a patient to create a prescription</p>
                <div className="relative mt-3">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" />
                </div>
              </div>
              <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                {filteredAppointments.map(apt => (
                  <button
                    key={apt.id}
                    onClick={() => { setSelectedApt(apt); setStep('create') }}
                    className="w-full px-6 py-4 text-left hover:bg-blue-50/30 transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center border border-green-100">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{apt.patient_name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(apt.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-300" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Past Prescriptions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-xl">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Past Prescriptions</h2>
                  <p className="text-sm text-gray-500">Your prescription history</p>
                </div>
              </div>
              <button onClick={() => setStep('history')} className="text-sm text-blue-600 font-medium hover:text-blue-700 transition">
                View All
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {prescriptions.length > 0 ? prescriptions.slice(0, 5).map(rx => (
                <div key={rx.id} className="px-6 py-4 hover:bg-gray-50/50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                      <Pill className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Prescription for {rx.profiles?.full_name || 'Patient'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(rx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-8 text-center text-gray-400 text-sm">No past prescriptions</div>
              )}
            </div>
          </div>
        </>
      )}

      {step === 'create' && selectedApt && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print-area" id="print-area">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-blue-50/50">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-blue-900">SwasthyaSetu</h2>
                <p className="text-sm text-blue-700">Digital Prescription</p>
              </div>
              <div className="text-right text-sm text-blue-700">
                <p>Date: {new Date().toLocaleDateString('en-IN')}</p>
                <p>RX-{Date.now().toString().slice(-6)}</p>
              </div>
            </div>
          </div>

          {/* Patient Info */}
          <div className="p-6 border-b">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-400">Name</span>
                <p className="font-medium text-gray-900 mt-0.5">{selectedApt.patient_name}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Date</span>
                <p className="font-medium text-gray-900 mt-0.5">
                  {new Date(selectedApt.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-gray-400">Diagnosis</span>
                <input type="text" value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
                  placeholder="Enter diagnosis..."
                  className="w-full mt-0.5 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
            </div>
          </div>

          {/* Medicines */}
          <div className="p-6 border-b">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Medicines</h3>
              <button onClick={addMedicine} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                <Plus className="w-4 h-4" /> Add Medicine
              </button>
            </div>
            <div className="space-y-4">
              {medicines.map((med, i) => (
                <div key={med.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">Medicine #{i + 1}</span>
                    {medicines.length > 1 && (
                      <button onClick={() => removeMedicine(med.id)} className="text-red-400 hover:text-red-600 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <input type="text" placeholder="Medicine name" value={med.name} onChange={e => updateMedicine(med.id, 'name', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    <input type="text" placeholder="Dosage (e.g. 500mg)" value={med.dosage} onChange={e => updateMedicine(med.id, 'dosage', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    <select value={med.frequency} onChange={e => updateMedicine(med.id, 'frequency', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                      <option value="">Frequency</option>
                      <option value="1-0-0">Once daily (1-0-0)</option>
                      <option value="1-0-1">Twice daily (1-0-1)</option>
                      <option value="1-1-1">Thrice daily (1-1-1)</option>
                      <option value="SOS">As needed (SOS)</option>
                    </select>
                    <input type="text" placeholder="Duration (e.g. 5 days)" value={med.duration} onChange={e => updateMedicine(med.id, 'duration', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  </div>
                  <input type="text" placeholder="Instructions (e.g. After food)" value={med.instructions} onChange={e => updateMedicine(med.id, 'instructions', e.target.value)}
                    className="w-full mt-3 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Advice & Follow-up */}
          <div className="p-6 border-b">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Advice & Follow-up</h3>
            <textarea value={advice} onChange={e => setAdvice(e.target.value)} rows={3}
              placeholder="Additional advice for patient..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 mb-4" />
            <div>
              <span className="text-sm text-gray-500">Follow-up Date:</span>
              <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)}
                className="ml-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
            <button onClick={() => setStep('select')} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
              Back
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={handleSave} disabled={saving || medicines.every(m => !m.name)}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
              {saving ? 'Saving...' : <><Check className="w-4 h-4" /> Save Prescription</>}
            </button>
          </div>
        </div>
      )}

      {step === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">All Prescriptions</h2>
            <button onClick={() => setStep('select')} className="text-sm text-blue-600 font-medium hover:text-blue-700 transition">
              New Prescription
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {prescriptions.length > 0 ? (
              prescriptions.map(rx => (
                <div key={rx.id} className="px-6 py-5 hover:bg-gray-50/50 transition">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center border border-green-100 shrink-0">
                      <Pill className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Prescription for {rx.profiles?.full_name || 'Patient'}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {new Date(rx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {rx.advice && <p className="text-sm text-gray-600 mt-2">{rx.advice}</p>}
                      {rx.follow_up_date && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-blue-600 bg-blue-50 w-fit px-3 py-1.5 rounded-lg">
                          <Calendar className="w-4 h-4" />
                          <span>Follow-up: {new Date(rx.follow_up_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                        </div>
                      )}
                      {rx.medicines && rx.medicines.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {rx.medicines.map((m: Medicine, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-gray-50 text-xs text-gray-600 rounded-lg border border-gray-100">
                              {m.name} {m.dosage && `- ${m.dosage}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center">
                <Pill className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No prescriptions yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
