// AI Symptom Triage Logic
// In production, this would call an AI API. For now, rule-based triage.

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency'

export type SymptomOption = {
  id: string
  label: string
  labelHi: string
  category: string
}

export const symptoms: SymptomOption[] = [
  { id: 'fever', label: 'Fever', labelHi: 'बुखार', category: 'general' },
  { id: 'cough', label: 'Cough', labelHi: 'खांसी', category: 'respiratory' },
  { id: 'headache', label: 'Headache', labelHi: 'सिरदर्द', category: 'general' },
  { id: 'breathing', label: 'Difficulty Breathing', labelHi: 'सांस लेने में तकलीफ', category: 'respiratory' },
  { id: 'chest_pain', label: 'Chest Pain', labelHi: 'सीने में दर्द', category: 'cardiac' },
  { id: 'stomach_pain', label: 'Stomach Pain', labelHi: 'पेट दर्द', category: 'digestive' },
  { id: 'diarrhea', label: 'Diarrhea', labelHi: 'दस्त', category: 'digestive' },
  { id: 'vomiting', label: 'Vomiting', labelHi: 'उल्टी', category: 'digestive' },
  { id: 'rash', label: 'Skin Rash', labelHi: 'त्वचा पर दाने', category: 'dermatology' },
  { id: 'joint_pain', label: 'Joint Pain', labelHi: 'जोड़ों में दर्द', category: 'musculoskeletal' },
  { id: 'fatigue', label: 'Fatigue', labelHi: 'थकान', category: 'general' },
  { id: 'dizziness', label: 'Dizziness', labelHi: 'चक्कर आना', category: 'neurological' },
]

const emergencyKeywords = ['breathing', 'chest_pain']
const highKeywords = ['fever', 'vomiting', 'dizziness']
const mediumKeywords = ['cough', 'headache', 'stomach_pain', 'diarrhea']

export function triageSymptoms(selectedSymptoms: string[]): {
  urgency: UrgencyLevel
  suggestion: string
  suggestionHi: string
  recommendedSpecialist: string
} {
  if (selectedSymptoms.length === 0) {
    return {
      urgency: 'low',
      suggestion: 'Please select at least one symptom',
      suggestionHi: 'कृपया कम से कम एक लक्षण चुनें',
      recommendedSpecialist: 'General Physician',
    }
  }

  const hasEmergency = selectedSymptoms.some(s => emergencyKeywords.includes(s))
  const hasHigh = selectedSymptoms.some(s => highKeywords.includes(s))
  const hasMedium = selectedSymptoms.some(s => mediumKeywords.includes(s))

  if (hasEmergency) {
    return {
      urgency: 'emergency',
      suggestion: 'URGENT: Seek immediate medical attention. Call 108 for emergency services.',
      suggestionHi: 'तुरंत चिकित्सा सहायता लें। आपातकालीन सेवाओं के लिए 108 पर कॉल करें।',
      recommendedSpecialist: 'Emergency Medicine',
    }
  }

  if (hasHigh) {
    return {
      urgency: 'high',
      suggestion: 'Book a consultation within 24 hours. A doctor should evaluate your symptoms soon.',
      suggestionHi: '24 घंटे के भीतर परामर्श बुक करें। एक डॉक्टर को आपके लक्षणों का मूल्यांकन जल्द करना चाहिए।',
      recommendedSpecialist: 'General Physician',
    }
  }

  if (hasMedium) {
    return {
      urgency: 'medium',
      suggestion: 'Schedule a consultation within the next few days. Monitor your symptoms.',
      suggestionHi: 'अगले कुछ दिनों में परामर्श निर्धारित करें। अपने लक्षणों पर नज़र रखें।',
      recommendedSpecialist: 'General Physician',
    }
  }

  return {
    urgency: 'low',
    suggestion: 'Your symptoms appear mild. You can book a routine consultation if needed.',
    suggestionHi: 'आपके लक्षण हल्क प्रतीत होते हैं। यदि आवश्यक हो तो आप नियमित परामर्श बुक कर सकते हैं।',
    recommendedSpecialist: 'General Physician',
  }
}
