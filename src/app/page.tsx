import Link from 'next/link'
import { GraduationCap, Users, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/shared/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-6xl font-bold text-transparent">
            LearnSphere
          </h1>
          <p className="mb-12 text-xl text-gray-600">
            Professional eLearning Platform for Instructors & Learners
          </p>

          {/* Navigation Cards */}
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {/* Admin Card */}
            <Link href="/login">
              <div className="card-odoo group cursor-pointer p-8 transition-all hover:scale-105 hover:shadow-xl">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200">
                    <ShieldCheck className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900">Admin Portal</h2>
                <p className="mb-4 text-gray-600">
                  Super user access to manage platform, users, courses & settings
                </p>
                <Button variant="odoo" className="w-full">
                  Admin Login
                </Button>
              </div>
            </Link>

            {/* Instructor Card */}
            <Link href="/login">
              <div className="card-odoo group cursor-pointer p-8 transition-all hover:scale-105 hover:shadow-xl">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 group-hover:bg-purple-200">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900">Instructor Portal</h2>
                <p className="mb-4 text-gray-600">
                  Create and manage courses, track student progress & build content
                </p>
                <Button variant="odoo" className="w-full">
                  Instructor Login
                </Button>
              </div>
            </Link>

            {/* Learner Card */}
            <Link href="/login">
              <div className="card-odoo group cursor-pointer p-8 transition-all hover:scale-105 hover:shadow-xl">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 group-hover:bg-pink-200">
                    <GraduationCap className="h-8 w-8 text-pink-600" />
                  </div>
                </div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900">Learning Portal</h2>
                <p className="mb-4 text-gray-600">
                  Explore courses, track your progress, and earn badges as you learn
                </p>
                <Button variant="odoo" className="w-full">
                  Learner Login
                </Button>
              </div>
            </Link>
          </div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-purple-200 bg-white/50 p-6">
              <h3 className="mb-2 font-semibold text-gray-900">Kanban & List Views</h3>
              <p className="text-sm text-gray-600">Organize courses with flexible view options</p>
            </div>
            <div className="rounded-lg border border-purple-200 bg-white/50 p-6">
              <h3 className="mb-2 font-semibold text-gray-900">Advanced Quiz Builder</h3>
              <p className="text-sm text-gray-600">Create engaging quizzes with dynamic rewards</p>
            </div>
            <div className="rounded-lg border border-purple-200 bg-white/50 p-6">
              <h3 className="mb-2 font-semibold text-gray-900">Gamification System</h3>
              <p className="text-sm text-gray-600">6-tier badge system to motivate learners</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t py-8 text-center text-sm text-gray-600">
        <p>Built with Next.js 15, Supabase, Drizzle ORM & Tailwind CSS</p>
      </footer>
    </div>
  )
}
