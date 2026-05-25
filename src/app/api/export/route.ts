import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: appointments } = await supabase.from('appointments').select('*').or(`patient_id.eq.${user.id},doctor_id.eq.${user.id}`)
  const { data: records } = await supabase.from('health_records').select('*').or(`patient_id.eq.${user.id},doctor_id.eq.${user.id}`)
  const { data: prescriptions } = await supabase.from('prescriptions').select('*').or(`patient_id.eq.${user.id},doctor_id.eq.${user.id}`)
  const { data: messages } = await supabase.from('messages').select('*').or(`sender_id.eq.${user.id}`)

  const exportData = {
    exported_at: new Date().toISOString(),
    user: { id: user.id, email: user.email },
    profile,
    appointments,
    health_records: records,
    prescriptions,
    messages,
  }

  return NextResponse.json(exportData, {
    headers: {
      'Content-Disposition': `attachment; filename="swasthyasetu-data-export-${user.id.slice(0, 8)}.json"`,
    },
  })
}
