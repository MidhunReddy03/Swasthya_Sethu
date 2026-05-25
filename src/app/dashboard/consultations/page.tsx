'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { Star, Clock, Video, Search, MapPin, Filter, ArrowRight, Stethoscope } from 'lucide-react'

type DoctorProfile = {
  id: string
  specialization: string
  experience_years: number
  consultation_fee: number
  is_available: boolean
  rating: number
  bio: string | null
  languages_spoken: string[]
  hospital: string | null
  degree: string | null
  qualification: string | null
  profiles: {
    full_name: string
    avatar_url: string | null
    language: string
  } | null
}

export default function ConsultationsPage() {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([])
  const [search, setSearch] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDoctors = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('doctor_profiles')
        .select('*, profiles(full_name, avatar_url, language)')
        .eq('is_available', true)

      if (data) setDoctors(data as DoctorProfile[])
      setLoading(false)
    }
    fetchDoctors()
  }, [])

  const filtered = doctors.filter((d) => {
    const matchSearch = !search || 
      d.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(search.toLowerCase())
    const matchSpec = !specialization || d.specialization === specialization
    return matchSearch && matchSpec
  })

  const specializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded-lg shimmer" />
        <div className="h-16 bg-white rounded-xl shimmer" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-white rounded-xl shimmer" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-8">
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="w-5 h-5 text-blue-200" />
            <span className="text-blue-200 text-sm font-medium">Find Care</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Find a Doctor
          </h1>
          <p className="text-blue-100/80">Book a consultation with verified specialists near you</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or specialization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="pl-10 pr-8 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm appearance-none min-w-[180px]"
            >
              <option value="">All Specializations</option>
              {specializations.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length > 0 ? (
          filtered.map((doctor, i) => (
            <div
              key={doctor.id}
              className="group card-hover bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Card Top */}
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-200/50">
                      {doctor.profiles?.full_name?.charAt(0) || 'D'}
                    </div>
                    {doctor.is_available && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{doctor.profiles?.full_name || 'Doctor'}</h3>
                    <p className="text-sm text-blue-600 font-medium">{doctor.specialization}</p>
                    {doctor.degree && <p className="text-xs text-gray-500 mt-0.5">{doctor.degree}</p>}
                    <div className="flex items-center gap-2 mt-1.5 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{doctor.rating || 'New'}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{doctor.experience_years} yrs</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {doctor.hospital && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{doctor.hospital}</span>
                    </div>
                  )}
                  {doctor.qualification && (
                    <div className="flex items-center gap-1.5 text-xs text-yellow-700 bg-yellow-50 w-fit px-2.5 py-1 rounded-lg">
                      <Star className="w-3 h-3" />
                      <span>{doctor.qualification}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {doctor.languages_spoken?.map((lang) => (
                      <span key={lang} className="px-2.5 py-1 bg-gray-100 text-xs font-medium text-gray-600 rounded-lg">
                        {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : lang === 'pa' ? 'ਪੰਜਾਬੀ' : lang === 'ta' ? 'தமிழ்' : lang === 'te' ? 'తెలుగు' : lang}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                    {doctor.bio || 'Experienced specialist available for online consultation.'}
                  </p>
                </div>
              </div>

              {/* Card Bottom */}
              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-gray-900">₹{doctor.consultation_fee}</span>
                  <span className="text-sm text-gray-500 ml-1">/ session</span>
                </div>
                <Link
                  href={`/dashboard/consultations/book/${doctor.id}`}
                  className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 border border-blue-200 text-sm font-semibold rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm"
                >
                  Book Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No doctors match your search</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or check back later</p>
            <button
              onClick={() => { setSearch(''); setSpecialization('') }}
              className="mt-4 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
