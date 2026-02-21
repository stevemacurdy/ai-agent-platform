import Link from 'next/link'
import { Sparkles, ArrowLeft, MapPin, Clock, DollarSign, ArrowRight, Heart, Zap, Globe, Users } from 'lucide-react'

const jobs = [
  { title: 'Senior Full-Stack Engineer', department: 'Engineering', location: 'Remote (US)', type: 'Full-time', salary: '$150K - $200K' },
  { title: 'AI/ML Engineer', department: 'Engineering', location: 'Remote (US)', type: 'Full-time', salary: '$160K - $220K' },
  { title: 'Product Designer', department: 'Design', location: 'Remote (US)', type: 'Full-time', salary: '$120K - $160K' },
  { title: 'Customer Success Manager', department: 'Customer Success', location: 'Remote (US)', type: 'Full-time', salary: '$90K - $120K' },
  { title: 'DevOps Engineer', department: 'Engineering', location: 'Remote (US)', type: 'Full-time', salary: '$140K - $180K' },
  { title: 'Technical Writer', department: 'Marketing', location: 'Remote (US)', type: 'Full-time', salary: '$80K - $110K' },
]

const benefits = [
  { icon: Heart, title: 'Health & Wellness', desc: 'Comprehensive health, dental, and vision insurance' },
  { icon: DollarSign, title: 'Competitive Pay', desc: 'Top-of-market salaries plus equity' },
  { icon: Globe, title: 'Remote First', desc: 'Work from anywhere in the US' },
  { icon: Zap, title: 'Learning Budget', desc: '$2,000/year for courses and conferences' },
  { icon: Clock, title: 'Flexible PTO', desc: 'Unlimited vacation policy' },
  { icon: Users, title: 'Team Retreats', desc: 'Annual in-person gatherings' },
]

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">WoulfAI</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Join Our Team</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Help us build the future of AI-powered business operations. 
            We&apos;re looking for passionate people to join our mission.
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Why Work With Us</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => (
              <div key={i} className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                <benefit.icon className="w-10 h-10 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div>
          <h2 className="text-2xl font-bold mb-8">Open Positions</h2>
          <div className="space-y-4">
            {jobs.map((job, i) => (
              <div key={i} className="p-6 bg-white/[0.02] border border-white/10 rounded-xl hover:border-blue-500/50 transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold group-hover:text-blue-400 transition-colors">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
                      <span>{job.department}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{job.type}</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{job.salary}</span>
                    </div>
                  </div>
                  <Link 
                    href="/contact" 
                    className="inline-flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors whitespace-nowrap"
                  >
                    Apply Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 p-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-xl text-center">
          <h2 className="text-2xl font-bold mb-4">Don&apos;t See the Right Role?</h2>
          <p className="text-gray-400 mb-6">
            We&apos;re always looking for talented people. Send us your resume and we&apos;ll keep you in mind.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors">
            Get in Touch <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          © 2026 WoulfAI. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
