import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Video, Calendar, FileText, MessageSquare, LogOut, User, Users, Stethoscope, CreditCard, Activity, Shield } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import NotificationBell from '@/components/NotificationBell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/login')
  }

  // Role-based navigation
  const getNavItems = (role: string) => {
    if (role === 'admin') {
      return [
        { icon: Shield, label: 'Admin Panel', href: '/dashboard/admin' },
        { icon: Users, label: 'All Users', href: '/dashboard/admin' },
        { icon: Calendar, label: 'Appointments', href: '/dashboard/appointments' },
        { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' },
      ]
    }

    if (role === 'doctor') {
      return [
        { icon: Calendar, label: 'Appointments', href: '/dashboard/appointments' },
        { icon: User, label: 'My Patients', href: '/dashboard/patients' },
        { icon: CreditCard, label: 'Payments', href: '/dashboard/payments' },
        { icon: Stethoscope, label: 'Prescriptions', href: '/dashboard/prescriptions' },
        { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' },
      ]
    }

    if (role === 'asha') {
      return [
        { icon: Users, label: 'ASHA Dashboard', href: '/dashboard/asha' },
        { icon: Calendar, label: 'Appointments', href: '/dashboard/appointments' },
        { icon: Video, label: 'Consultations', href: '/dashboard/consultations' },
        { icon: FileText, label: 'Records', href: '/dashboard/records' },
        { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' },
      ]
    }

    return [
      { icon: Calendar, label: 'Appointments', href: '/dashboard/appointments' },
      { icon: Video, label: 'Consultations', href: '/dashboard/consultations' },
      { icon: FileText, label: 'Records', href: '/dashboard/records' },
      { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' },
    ]
  }

  const navItems = getNavItems(profile?.role || 'patient')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r hidden md:block">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">SwasthyaSetu</span>
            </div>
          </div>
          
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t">
          <form action={handleSignOut}>
            <button className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Video className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">SwasthyaSetu</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main Content */}
      <main className="md:pl-64">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-end items-center gap-3 p-4 border-b bg-white">
          <NotificationBell />
          <LanguageSwitcher />
        </div>
        <div className="max-w-7xl mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
