'use client'

import { useState, useEffect } from 'react'
import { languages, Language } from '@/lib/i18n/translations'
import { Globe } from 'lucide-react'

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<Language>('en')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Language
    if (saved && languages.some(l => l.code === saved)) {
      setCurrentLang(saved)
    }
  }, [])

  const handleLangChange = (lang: Language) => {
    setCurrentLang(lang)
    localStorage.setItem('lang', lang)
    setOpen(false)
    // In a real app, you might trigger a page reload or context update here
    window.location.reload() 
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{languages.find(l => l.code === currentLang)?.native}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20 py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLangChange(lang.code)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition ${
                  lang.code === currentLang ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                }`}
              >
                {lang.native}
                <span className="ml-2 text-xs text-gray-400">{lang.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
