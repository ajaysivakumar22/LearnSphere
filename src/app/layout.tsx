import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/shared/toaster'
import { ThemeProvider } from '@/lib/theme-context'
import { AuthProvider } from '@/lib/auth-context'
import { CourseStoreProvider } from '@/lib/course-store'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LearnSphere - Professional eLearning Platform',
  description: 'A comprehensive dual-sided eLearning platform built with Next.js 15',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <CourseStoreProvider>
              {children}
              <Toaster />
            </CourseStoreProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
