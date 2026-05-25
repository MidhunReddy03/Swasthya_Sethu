'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-client'
import { FileText, Calendar, Pill, Heart, Search, Plus, User, Stethoscope, Printer, Upload, File, X, Download, Shield } from 'lucide-react'
import Link from 'next/link'

type Record = {
  id: string
  created_at: string
  diagnosis: string
  symptoms: string[] | null
  notes: string | null
  doctor_id?: string
  patient_id?: string
  doctor_name?: string
  patient_name?: string
}

type Prescription = {
  id: string
  created_at: string
  advice: string | null
  follow_up_date: string | null
  medicines: any[]
  doctor_name?: string
  patient_name?: string
}

export default function RecordsPage() {
  const [records, setRecords] = useState<Record[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<'patient' | 'doctor'>('patient')
  const [tab, setTab] = useState<'records' | 'prescriptions'>('records')
  const [search, setSearch] = useState('')
  const [documents, setDocuments] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      const userRole = profile?.role || 'patient'
      setRole(userRole)

      if (userRole === 'patient') {
        // Patient: their own records
        const { data: r } = await supabase
          .from('health_records')
          .select('*, profiles!health_records_doctor_id_fkey(full_name)')
          .eq('patient_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)
        if (r) setRecords(r.map((rec: any) => ({ ...rec, doctor_name: rec.profiles?.full_name })))

        const { data: p } = await supabase
          .from('prescriptions')
          .select('*, profiles!prescriptions_doctor_id_fkey(full_name)')
          .eq('patient_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
        if (p) setPrescriptions(p.map((rx: any) => ({ ...rx, doctor_name: rx.profiles?.full_name })))
      } else {
        // Doctor: records of their patients (from completed appointments)
        const { data: apts } = await supabase
          .from('appointments')
          .select('patient_id')
          .eq('doctor_id', user.id)
          .in('status', ['confirmed', 'completed'])
        const pIds = [...new Set(apts?.map(a => a.patient_id) || [])]

        if (pIds.length > 0) {
          // Get patient names
          const { data: names } = await supabase.from('profiles').select('id, full_name').in('id', pIds)
          const nameMap = new Map(names?.map(n => [n.id, n.full_name]) || [])

          const { data: r } = await supabase
            .from('health_records')
            .select('*')
            .in('patient_id', pIds)
            .order('created_at', { ascending: false })
            .limit(20)
          if (r) setRecords(r.map(rec => ({ ...rec, patient_name: nameMap.get(rec.patient_id) || 'Unknown' })))

          const { data: p } = await supabase
            .from('prescriptions')
            .select('*')
            .in('patient_id', pIds)
            .order('created_at', { ascending: false })
            .limit(10)
          if (p) setPrescriptions(p.map(rx => ({ ...rx, doctor_name: 'You', patient_name: nameMap.get(rx.patient_id) || 'Unknown' })))
        }
      }
      // Load documents
      if (userRole === 'patient') {
        const { data: files } = await supabase.storage.from('patient_documents').list(`${user.id}/`)
        if (files) setDocuments(files)
      }

      setLoading(false)
    }
    init()
  }, [])

  const uploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const path = `${user.id}/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('patient_documents').upload(path, file)
    if (!error) {
      const { data: files } = await supabase.storage.from('patient_documents').list(`${user.id}/`)
      if (files) setDocuments(files)
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const deleteDocument = async (name: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.storage.from('patient_documents').remove([`${user.id}/${name}`])
    setDocuments(prev => prev.filter(d => d.name !== name))
  }

  const printPrescription = (rx: Prescription) => {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><title>Prescription</title>
<style>
  body { font-family: Georgia, serif; padding: 40px; max-width: 700px; margin: 0 auto; color: #1a1a1a; }
  .header { text-align: center; border-bottom: 3px double #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
  .header h1 { font-size: 24px; margin: 0; color: #2563eb; }
  .header p { color: #666; margin: 4px 0 0; font-size: 13px; }
  .meta { display: flex; justify-content: space-between; font-size: 13px; color: #666; margin-bottom: 30px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f8fafc; text-align: left; padding: 10px 12px; font-size: 13px; color: #475569; border-bottom: 2px solid #e2e8f0; }
  td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
  .advice { margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; }
  .advice h3 { margin: 0 0 8px; font-size: 15px; color: #475569; }
  .advice p { margin: 0; line-height: 1.7; }
  .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
  @media print { body { padding: 20px; } }
</style></head><body>
<div class="header"><h1>Medical Prescription</h1><p>SwasthyaSetu Telemedicine</p></div>
<div class="meta"><span>Date: ${new Date(rx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
<span>Patient: ${rx.patient_name || 'Patient'}</span></div>
<table><thead><tr><th>#</th><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr></thead><tbody>
${(rx.medicines || []).map((m: any, i: number) => `<tr><td>${i + 1}</td><td><strong>${m.name}</strong></td><td>${m.dosage || '—'}</td><td>${m.frequency || '—'}</td><td>${m.duration || '—'}</td><td>${m.instructions || '—'}</td></tr>`).join('')}
</tbody></table>
${rx.advice ? `<div class="advice"><h3>Advice</h3><p>${rx.advice}</p></div>` : ''}
${rx.follow_up_date ? `<p style="margin-top:20px;color:#2563eb;">Follow-up: ${new Date(rx.follow_up_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>` : ''}
<div class="footer">Generated by SwasthyaSetu — This is a computer-generated prescription</div>
<script>window.print()</script></body></html>`)
    win.document.close()
  }

  const filteredRecords = records.filter(r =>
    r.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
    (r.patient_name || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="space-y-4">{['h-48', 'h-32', 'h-32'].map((h, i) => <div key={i} className={`${h} bg-white rounded-2xl shimmer`} />)}</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-8">
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-blue-200" />
            <span className="text-blue-200 text-sm font-medium">{role === 'doctor' ? 'Patient Records' : 'Records'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Health Records</h1>
          <p className="text-blue-100/80">{role === 'doctor' ? 'View medical records of your patients' : 'Your medical history and prescriptions'}</p>
        </div>
      </div>

      {/* Document Upload (Patients) */}
      {role === 'patient' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Upload Medical Documents</h2>
            </div>
            <button onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition shadow-sm flex items-center gap-2">
              <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={uploadDocument} className="hidden" />
          </div>
          {documents.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {documents.map(doc => (
                <div key={doc.name} className="group relative flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition">
                  <File className="w-8 h-8 text-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{doc.name.replace(/^\d+_/, '')}</p>
                    <p className="text-[10px] text-gray-400">{doc.metadata ? `${(doc.metadata.size / 1024).toFixed(1)} KB` : ''}</p>
                  </div>
                  <a href={supabase.storage.from('patient_documents').getPublicUrl(doc.name).data.publicUrl} target="_blank" rel="noreferrer"
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-blue-600 transition">
                    <Download className="w-4 h-4" />
                  </a>
                  <button onClick={() => deleteDocument(doc.name)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {documents.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No documents uploaded yet. Upload prescriptions, reports, or scans.</p>
          )}
        </div>
      )}

      {/* Data Export */}
      {role === 'patient' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Privacy & Data Export</h2>
                <p className="text-xs text-gray-500">Download all your data as JSON</p>
              </div>
            </div>
            <a href="/api/export"
              className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition shadow-sm flex items-center gap-2">
              <Download className="w-4 h-4" /> Export My Data
            </a>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder={role === 'doctor' ? 'Search by patient name or diagnosis...' : 'Search by diagnosis...'}
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 p-1.5 shadow-sm flex gap-1">
        {(['records', 'prescriptions'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all capitalize ${
              tab === t ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}>
            {t} {t === 'records' ? `(${records.length})` : `(${prescriptions.length})`}
          </button>
        ))}
      </div>

      {/* Records */}
      {tab === 'records' && (
        <div className="space-y-4">
          {filteredRecords.length > 0 ? (
            filteredRecords.map(rec => (
              <div key={rec.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center border border-blue-100 shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{rec.diagnosis}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {role === 'doctor' ? `Patient: ${rec.patient_name || 'Unknown'}` : `Dr. ${rec.doctor_name || 'Doctor'}`}
                          {' • '}
                          {new Date(rec.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    {rec.symptoms && rec.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {rec.symptoms.map((s, i) => (
                          <span key={i} className="px-2.5 py-1 bg-gray-50 text-xs text-gray-600 rounded-lg border border-gray-100">{s}</span>
                        ))}
                      </div>
                    )}
                    {rec.notes && (
                      <p className="text-sm text-gray-600 mt-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 leading-relaxed">{rec.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No health records found</p>
              <p className="text-sm text-gray-400 mt-1">
                {role === 'doctor' ? 'Records will appear after consultations' : 'Your records will appear after your first consultation'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Prescriptions */}
      {tab === 'prescriptions' && (
        <div className="space-y-4">
          {prescriptions.length > 0 ? (
            prescriptions.map(rx => (
              <div key={rx.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center border border-green-100 shrink-0">
                    <Pill className="w-5 h-5 text-green-600" />
                  </div>
                    <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {role === 'doctor' ? `Prescription for ${rx.patient_name || 'Patient'}` : 'Prescription'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {role === 'doctor' ? '' : `Dr. ${rx.doctor_name || 'Doctor'}`}
                          {new Date(rx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      {role === 'patient' && (
                        <button onClick={() => printPrescription(rx)}
                          className="shrink-0 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 transition flex items-center gap-1.5">
                          <Printer className="w-3.5 h-3.5" /> Print / Download
                        </button>
                      )}
                    </div>
                    {rx.medicines && rx.medicines.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {rx.medicines.map((m: any, i: number) => (
                          <span key={i} className="px-3 py-1.5 bg-gray-50 text-xs text-gray-700 rounded-lg border border-gray-100 flex items-center gap-1">
                            <Pill className="w-3 h-3" />
                            {m.name} {m.dosage && `- ${m.dosage}`} {m.frequency && `(${m.frequency})`}
                          </span>
                        ))}
                      </div>
                    )}
                    {rx.advice && <p className="text-sm text-gray-600 mt-3">{rx.advice}</p>}
                    {rx.follow_up_date && (
                      <div className="flex items-center gap-2 mt-3 text-sm text-blue-600 bg-blue-50 w-fit px-3 py-1.5 rounded-lg">
                        <Calendar className="w-4 h-4" />
                        <span>Follow-up: {new Date(rx.follow_up_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
              <Pill className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No prescriptions yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
