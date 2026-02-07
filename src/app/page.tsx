import Link from 'next/link'
import { GraduationCap, BookOpen, Brain, Trophy, Sparkles, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: '#0f0f0f' }}>
      {/* Hero Section */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-20">
        {/* Logo */}
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-violet-500 shadow-2xl shadow-purple-500/30">
          <GraduationCap className="h-12 w-12 text-white" />
        </div>

        {/* Title */}
        <h1 className="mb-4 bg-gradient-to-r from-purple-400 via-violet-400 to-pink-400 bg-clip-text text-center text-6xl font-bold tracking-tight text-transparent">
          LearnSphere
        </h1>
        <p className="mb-10 max-w-lg text-center text-lg" style={{ color: '#999' }}>
          A modern eLearning platform to create, manage, and explore courses — all in one place.
        </p>

        {/* Single Login Button */}
        <Link href="/login" className="group">
          <button
            className="flex h-14 cursor-pointer items-center gap-3 rounded-2xl px-10 text-base font-semibold text-white shadow-xl shadow-purple-500/20 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
          >
            Get Started
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </Link>

        {/* Guest link */}
        <Link
          href="/learner/explore"
          className="mt-5 text-sm transition-colors"
          style={{ color: '#666' }}
        >
          or browse courses as a guest
        </Link>
      </div>

      {/* Features */}
      <div className="border-t px-4 py-16" style={{ borderColor: '#1a1a1a' }}>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: BookOpen, label: 'Course Builder', desc: 'Kanban & list views with rich editor' },
            { icon: Brain, label: 'Quiz Engine', desc: 'Dynamic quizzes with point rewards' },
            { icon: Trophy, label: 'Gamification', desc: '6-tier badge system for learners' },
            { icon: Sparkles, label: 'Role-based Access', desc: 'Smart permissions per user type' },
          ].map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.label}
                className="rounded-xl border p-6 text-center transition-colors"
                style={{ borderColor: '#1f1f1f', backgroundColor: '#141414' }}
              >
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg" style={{ backgroundColor: '#1f1f1f' }}>
                  <Icon className="h-5 w-5" style={{ color: '#a78bfa' }} />
                </div>
                <h3 className="mb-1 text-sm font-semibold" style={{ color: '#e5e5e5' }}>{feat.label}</h3>
                <p className="text-xs" style={{ color: '#666' }}>{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs" style={{ borderColor: '#1a1a1a', color: '#444' }}>
        Built with Next.js 15, React & Tailwind CSS
      </footer>
    </div>
  )
}
