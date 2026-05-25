import Link from 'next/link'
import { Video, Phone, MessageSquare, Shield, Globe, Clock, ArrowRight, Star, CheckCircle, Sparkles, Heart, Users, Activity } from 'lucide-react'

const features = [
  {
    icon: Video,
    title: 'Low-Bandwidth Video',
    desc: 'Optimized for 2G networks with auto fallback to audio when connection drops.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: MessageSquare,
    title: 'Offline-First Messaging',
    desc: 'Messages sync automatically when connectivity returns. Never lose a prescription.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Phone,
    title: 'ASHA Worker Mode',
    desc: 'Empower local health workers to book and manage consultations for entire communities.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Shield,
    title: 'NDHM Compliant',
    desc: 'Fully compliant with Ayushman Bharat Digital Mission standards for health data.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Globe,
    title: '5+ Regional Languages',
    desc: 'Full interface support in Hindi, Punjabi, Tamil, Telugu, and English.',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: Sparkles,
    title: 'AI Symptom Checker',
    desc: 'Smart triage system that helps prioritize urgent cases and suggests specialists.',
    color: 'from-rose-500 to-pink-500',
  },
]

const stats = [
  { value: '10M+', label: 'Rural Patients Served' },
  { value: '50K+', label: 'Verified Doctors' },
  { value: '99.9%', label: 'Uptime Guarantee' },
  { value: '12+', label: 'Languages Supported' },
]

const steps = [
  { num: '01', title: 'Select Symptoms', desc: 'Use our AI symptom checker to describe what you feel' },
  { num: '02', title: 'Choose a Doctor', desc: 'Browse verified specialists tailored to your needs' },
  { num: '03', title: 'Get Treated', desc: 'Connect via video, audio, or chat — even on 2G networks' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-white">
      {/* Header */}
      <header className="glass border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                SwasthyaSetu
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
              <Link href="#features" className="hover:text-gray-900 transition-colors">Features</Link>
              <Link href="#how-it-works" className="hover:text-gray-900 transition-colors">How it Works</Link>
              <Link href="#for-doctors" className="hover:text-gray-900 transition-colors">For Doctors</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all hidden sm:inline-block">
                Sign in
              </Link>
              <Link href="/auth/register" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-200">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50/50 pointer-events-none" />
        <div className="absolute top-0 -left-32 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-32 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100/80 text-blue-700 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-blue-200/50 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>Now available in 12 regional languages</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 bg-clip-text text-transparent">
                Healthcare that reaches
              </span>
              <br />
              <span className="gradient-text">every village in India</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animate-delay-100">
              Connect with qualified doctors through video, audio, or chat. 
              Built for low-bandwidth areas with offline support and ASHA worker integration.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animate-delay-200">
              <Link href="/auth/register" className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl shadow-blue-200/50">
                <Heart className="w-5 h-5" />
                Start Your Consultation
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#how-it-works" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl hover:border-blue-200 hover:bg-blue-50/30 transition-all shadow-lg">
                <Activity className="w-5 h-5" />
                See How It Works
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-6 sm:gap-10 text-sm animate-fade-in-up animate-delay-300">
              {[
                { icon: Shield, label: 'NDHM Compliant' },
                { icon: Clock, label: '24/7 Available' },
                { icon: Users, label: '500+ Doctors' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-500">
                  <item.icon className="w-4 h-4 text-blue-500" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Built for rural healthcare challenges
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Every feature designed to overcome connectivity, literacy, and accessibility barriers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="card-hover group relative p-6 rounded-2xl bg-white border border-gray-100 hover:border-blue-100 shadow-sm hover:shadow-xl animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-2.5 mb-4 shadow-md`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.03] transition-opacity pointer-events-none`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-white to-blue-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
              <Activity className="w-4 h-4" />
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Three simple steps to better health
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              No complicated processes. Just instant access to verified doctors.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white text-2xl font-bold shadow-xl shadow-blue-200/50 mb-6">
                  {step.num}
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute -right-12 top-1/2 -translate-y-1/2 w-8 h-0.5 bg-blue-200" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 animate-fade-in-up">
            Ready to transform healthcare access?
          </h2>
          <p className="text-blue-100/90 mb-10 text-lg max-w-2xl mx-auto animate-fade-in-up animate-delay-100">
            Join thousands of patients and doctors already using SwasthyaSetu. 
            No setup costs, no hidden fees.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animate-delay-200">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-semibold rounded-2xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-all"
            >
              <Star className="w-5 h-5" />
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">SwasthyaSetu</span>
              </div>
              <p className="text-sm text-gray-500">Making quality healthcare accessible to every Indian, regardless of where they live.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4">For Patients</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth/register" className="hover:text-white transition-colors">Find a Doctor</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Symptom Checker</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Health Records</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4">For Doctors</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Join as Doctor</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Practice Dashboard</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Resources</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
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
