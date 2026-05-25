'use client'

import { useState } from 'react'
import { symptoms, triageSymptoms, UrgencyLevel } from '@/lib/triage'
import { AlertTriangle, AlertCircle, CheckCircle, ArrowRight, Stethoscope } from 'lucide-react'
import Link from 'next/link'

interface SymptomTriageProps {
  onTriageComplete?: (urgency: UrgencyLevel, specialist: string) => void
}

export default function SymptomTriage({ onTriageComplete }: SymptomTriageProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [result, setResult] = useState<ReturnType<typeof triageSymptoms> | null>(null)
  const [step, setStep] = useState<'select' | 'result'>('select')

  const toggleSymptom = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const analyzeSymptoms = () => {
    const triageResult = triageSymptoms(selected)
    setResult(triageResult)
    setStep('result')
    onTriageComplete?.(triageResult.urgency, triageResult.recommendedSpecialist)
  }

  const urgencyConfig = {
    low: { color: 'bg-green-100 border-green-300 text-green-800', icon: CheckCircle },
    medium: { color: 'bg-yellow-100 border-yellow-300 text-yellow-800', icon: AlertCircle },
    high: { color: 'bg-orange-100 border-orange-300 text-orange-800', icon: AlertTriangle },
    emergency: { color: 'bg-red-100 border-red-300 text-red-800', icon: AlertTriangle },
  }

  if (step === 'result' && result) {
    const config = urgencyConfig[result.urgency]
    return (
      <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
        <div className={`p-4 rounded-lg border ${config.color}`}>
          <div className="flex items-start gap-3">
            <config.icon className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg">
                {result.urgency === 'emergency' ? 'Emergency' :
                 result.urgency === 'high' ? 'Urgent' :
                 result.urgency === 'medium' ? 'Moderate' : 'Mild'}
              </h3>
              <p className="mt-1">{result.suggestion}</p>
              <p className="mt-1 text-sm opacity-80">{result.suggestionHi}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            <span className="font-medium">Recommended Specialist</span>
          </div>
          <p className="text-gray-700">{result.recommendedSpecialist}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStep('select')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Back
          </button>
          <Link
            href="/dashboard/consultations"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Book Consultation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Symptom Checker</h2>
        <p className="text-gray-600 mt-1">Select your symptoms to get an AI assessment</p>
        <p className="text-sm text-gray-500 mt-1">लक्षण चुनें और AI मूल्यांकन प्राप्त करें</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {symptoms.map((symptom) => (
          <button
            key={symptom.id}
            onClick={() => toggleSymptom(symptom.id)}
            className={`p-3 rounded-lg border text-left transition ${
              selected.includes(symptom.id)
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span className="text-sm font-medium">{symptom.label}</span>
            <span className="block text-xs text-gray-500 mt-1">{symptom.labelHi}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <span className="text-sm text-gray-500">
          {selected.length} symptom{selected.length !== 1 ? 's' : ''} selected
        </span>
        <button
          onClick={analyzeSymptoms}
          disabled={selected.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Analyze Symptoms
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center">
        This is not a medical diagnosis. Always consult a qualified healthcare provider.
      </p>
    </div>
  )
}
