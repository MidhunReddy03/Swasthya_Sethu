'use client'

import { useState } from 'react'
import { Plus, Trash2, Printer, Download, FileText } from 'lucide-react'

type Medicine = {
  id: string
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

export default function PrescriptionBuilder({
  patientName,
  patientAge,
  diagnosis,
  onSave,
}: {
  patientName: string
  patientAge: number
  diagnosis: string
  onSave?: (prescription: any) => void
}) {
  const [medicines, setMedicines] = useState<Medicine[]>([
    { id: '1', name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ])
  const [advice, setAdvice] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      { id: Date.now().toString(), name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ])
  }

  const removeMedicine = (id: string) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter(m => m.id !== id))
    }
  }

  const updateMedicine = (id: string, field: keyof Medicine, value: string) => {
    setMedicines(medicines.map(m => m.id === id ? { ...m, [field]: value } : m))
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      {/* Prescription Header */}
      <div className="p-6 border-b bg-blue-50">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-blue-900">SwasthyaSetu</h2>
            <p className="text-sm text-blue-700">Digital Prescription</p>
          </div>
          <div className="text-right text-sm text-blue-700">
            <p>Date: {new Date().toLocaleDateString()}</p>
            <p>Prescription ID: RX-{Date.now().toString().slice(-6)}</p>
          </div>
        </div>
      </div>

      {/* Patient Info */}
      <div className="p-6 border-b">
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Patient Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500">Name:</span>
            <p className="font-medium">{patientName}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Age:</span>
            <p className="font-medium">{patientAge} years</p>
          </div>
          <div className="col-span-2">
            <span className="text-sm text-gray-500">Diagnosis:</span>
            <p className="font-medium">{diagnosis}</p>
          </div>
        </div>
      </div>

      {/* Medicines */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">Medicines</h3>
          <button
            onClick={addMedicine}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Medicine
          </button>
        </div>

        <div className="space-y-4">
          {medicines.map((med, index) => (
            <div key={med.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Medicine #{index + 1}</span>
                {medicines.length > 1 && (
                  <button
                    onClick={() => removeMedicine(med.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Medicine Name"
                  value={med.name}
                  onChange={(e) => updateMedicine(med.id, 'name', e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Dosage (e.g., 500mg)"
                  value={med.dosage}
                  onChange={(e) => updateMedicine(med.id, 'dosage', e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={med.frequency}
                  onChange={(e) => updateMedicine(med.id, 'frequency', e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Frequency</option>
                  <option value="1-0-0">Once daily (1-0-0)</option>
                  <option value="1-0-1">Twice daily (1-0-1)</option>
                  <option value="1-1-1">Thrice daily (1-1-1)</option>
                  <option value="SOS">As needed (SOS)</option>
                </select>
                <input
                  type="text"
                  placeholder="Duration (e.g., 5 days)"
                  value={med.duration}
                  onChange={(e) => updateMedicine(med.id, 'duration', e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <input
                type="text"
                placeholder="Special instructions (e.g., After food)"
                value={med.instructions}
                onChange={(e) => updateMedicine(med.id, 'instructions', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Advice & Follow-up */}
      <div className="p-6 border-b">
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Advice & Follow-up</h3>
        <textarea
          placeholder="Additional advice for patient..."
          value={advice}
          onChange={(e) => setAdvice(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />
        <div>
          <label className="text-sm text-gray-500">Follow-up Date:</label>
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="ml-2 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50 flex justify-end gap-3">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
        <button
          onClick={() => onSave?.({ medicines, advice, followUpDate })}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          <FileText className="w-4 h-4" />
          Save Prescription
        </button>
      </div>
    </div>
  )
}
