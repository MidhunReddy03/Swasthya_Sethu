import Link from 'next/link'
import { Video, Phone, MessageSquare, Shield, Globe, Clock, ArrowRight, Star, CheckCircle, Sparkles, Heart, Users, Activity, ChevronDown } from 'lucide-react'
import { LogoWithText } from '@/components/Logo'

const features = [
  {
    icon: Video,
    title: 'Low-Bandwidth Video',
    desc: 'Optimized for 2G networks with auto fallback to audio when connection drops.',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
  },
  {
    icon: MessageSquare,
    title: 'Offline-First Messaging',
    desc: 'Messages sync automatically when connectivity returns. Never lose a prescription.',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50',
  },
  {
    icon: Phone,
    title: 'ASHA Worker Mode',
    desc: 'Empower local health workers to book and manage consultations for entire communities.',
    color: 'from-green-500 to-emerald-500',
    bg: 'bg-green-50',
  },
  {
    icon: Shield,
    title: 'NDHM Compliant',
    desc: 'Fully compliant with Ayushman Bharat Digital Mission standards for health data.',
    color: 'from-orange-500 to-red-500',
    bg: 'bg-orange-50',
  },
  {
    icon: Globe,
    title: '5+ Regional Languages',
    desc: 'Full interface support in Hindi, Punjabi, Tamil, Telugu, and English.',
    color: 'from-indigo-500 to-purple-500',
    bg: 'bg-indigo-50',
  },
  {
    icon: Sparkles,
    title: 'AI Symptom Checker',
    desc: 'Smart triage system that helps prioritize urgent cases and suggests specialists.',
    color: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50',
  },
]

const stats = [
  { value: '10M+', label: 'Rural Patients Served', icon: Users },
  { value: '50K+', label: 'Verified Doctors', icon: Star },
  { value: '99.9%', label: 'Uptime Guarantee', icon: Shield },
  { value: '12+', label: 'Languages Supported', icon: Globe },
]

const steps = [
  { num: '01', title: 'Describe Symptoms', desc: 'Use our AI-powered symptom checker to describe what you feel', color: 'from-blue-500 to-cyan-500' },
  { num: '02', title: 'Choose a Doctor', desc: 'Browse verified specialists tailored to your needs', color: 'from-purple-500 to-pink-500' },
  { num: '03', title: 'Get Treated', desc: 'Connect via video, audio, or chat — even on low-bandwidth networks', color: 'from-green-500 to-emerald-500' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-white overflow-x-hidden">
      {/* ===== HEADER ===== */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl glass-card shadow-lg shadow-black/5">
        <div className="flex items-center justify-between px-5 py-3">
          <Link href="/" className="group">
            <LogoWithText size="sm" />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="#features" className="hover:text-blue-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full">Features</Link>
            <Link href="#how-it-works" className="hover:text-blue-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full">How it Works</Link>
            <Link href="#for-doctors" className="hover:text-blue-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full">For Doctors</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
              Sign in
            </Link>
            <Link href="/auth/register" className="btn-depth inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-200/30">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* 3D Ambient Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] animate-float-slow" />
          <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-100/5 via-transparent to-purple-100/5 rounded-full blur-[150px]" />
          {/* Floating 3D orbs */}
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400/20 rounded-full animate-float" style={{ animationDuration: '7s' }} />
          <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-purple-400/20 rounded-full animate-float" style={{ animationDuration: '9s', animationDelay: '-2s' }} />
          <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-cyan-400/20 rounded-full animate-float" style={{ animationDuration: '8s', animationDelay: '-4s' }} />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100/60 text-blue-700 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-blue-200/50 animate-fade-in-down shadow-sm">
                <Sparkles className="w-4 h-4" />
                <span>Now available in 12 regional languages</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                <span className="text-gray-900">
                  Healthcare that
                </span>
                <br />
                <span className="gradient-text">
                  reaches every village
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-xl leading-relaxed animate-fade-in-up anim-delay-100">
                Connect with qualified doctors through video, audio, or chat. 
                Built for low-bandwidth areas with offline support and ASHA worker integration.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up anim-delay-200">
                <Link href="/auth/register" className="btn-depth inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl shadow-blue-200/40">
                  <Heart className="w-5 h-5" />
                  Start Your Consultation
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="#how-it-works" className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold text-gray-700 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-lg transition-all shadow-sm">
                  <Activity className="w-5 h-5" />
                  See How It Works
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-10 text-sm animate-fade-in-up anim-delay-300">
                {[
                  { icon: Shield, label: 'NDHM Compliant' },
                  { icon: Clock, label: '24/7 Available' },
                  { icon: Users, label: '500+ Doctors' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-400">
                    <item.icon className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - 3D Visual */}
            <div className="hidden lg:flex items-center justify-center animate-fade-in anim-delay-300">
              <div className="relative w-96 h-96 perspective-[1000px]">
                {/* 3D Layered Cards */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-[48px] transform rotate-3 translateZ(-20px) border border-blue-100/30" />
                <div className="absolute inset-4 bg-white rounded-[40px] shadow-2xl shadow-blue-200/20 border border-gray-100/50 transform -rotate-1 translateZ(-10px) backdrop-blur-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200/30">
                        <Video className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Video Consultation</p>
                        <p className="text-xs text-green-500">● Live</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-inner">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-glow">
                          <Video className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {[1,2,3].map(i => (
                          <div key={i} className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse" style={{ width: `${60 + i * 10}%`, animationDelay: `${i * 0.3}s` }} />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center"><Phone className="w-4 h-4 text-green-600" /></div>
                        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center"><MessageSquare className="w-4 h-4 text-blue-600" /></div>
                        <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center"><Shield className="w-4 h-4 text-purple-600" /></div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200/40 animate-float" style={{ animationDuration: '5s' }}>
                  <div className="text-center">
                    <p className="text-white text-xs font-bold">24/7</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
            <ChevronDown className="w-6 h-6 text-gray-300" />
          </div>
        </div>
      </section>

      {/* ===== TRUST STATS ===== */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="card-3d p-6 text-center animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100/60 text-blue-700 rounded-full text-sm font-medium mb-4 backdrop-blur-sm border border-blue-200/50">
              <Sparkles className="w-4 h-4" />
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Built for rural healthcare challenges
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Every feature designed to overcome connectivity, literacy, and accessibility barriers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="card-3d group p-6 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`} style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                  <feature.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                <div className={`absolute inset-0 rounded-[24px] bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.03] transition-opacity pointer-events-none`} />
                <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100/60 text-green-700 rounded-full text-sm font-medium mb-4 backdrop-blur-sm border border-green-200/50">
              <Activity className="w-4 h-4" />
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Three simple steps
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              No complicated processes. Just instant access to verified doctors.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-16 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200" />

            {steps.map((step, i) => (
              <div key={i} className="card-3d p-8 text-center animate-fade-in-up relative" style={{ animationDelay: `${i * 150}ms` }}>
                <div className={`relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br ${step.color} text-white text-2xl font-bold shadow-xl mb-6 group-hover:scale-110 transition-transform`}>
                  <div className="relative z-10">{step.num}</div>
                  <div className="absolute inset-0 rounded-3xl bg-white/10 animate-glow" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

        {/* Floating orbs */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl animate-float" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-xl animate-float-slow" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white/80 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/10">
            <Heart className="w-4 h-4" />
            <span>Start your health journey today</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 animate-fade-in-up">
            Ready to transform healthcare access?
          </h2>
          <p className="text-blue-100/80 mb-10 text-lg max-w-2xl mx-auto animate-fade-in-up anim-delay-100">
            Join thousands of patients and doctors already using SwasthyaSetu. 
            No setup costs, no hidden fees.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up anim-delay-200">
            <Link href="/auth/register" className="btn-depth inline-flex items-center gap-2.5 px-8 py-4 bg-white text-blue-700 font-semibold rounded-2xl hover:bg-blue-50 shadow-xl hover:shadow-2xl text-base">
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#features" className="inline-flex items-center gap-2.5 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-all text-base">
              <Star className="w-5 h-5" />
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <LogoWithText className="mb-4" />
              <p className="text-sm text-gray-500 leading-relaxed">Making quality healthcare accessible to every Indian, regardless of where they live.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4">For Patients</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/auth/register" className="hover:text-white transition-colors">Find a Doctor</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Symptom Checker</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Health Records</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4">For Doctors</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Join as Doctor</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Practice Dashboard</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Resources</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} SwasthyaSetu. Built for Smart India Hackathon &amp; Startup India.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
