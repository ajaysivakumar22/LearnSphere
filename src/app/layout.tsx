import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProviderWrapper } from '@/components/shared/clerk-provider-wrapper'
import { Toaster } from '@/components/shared/toaster'
import { ThemeProvider } from '@/lib/theme-context'
import { AuthProvider } from '@/lib/auth-context'
import { CourseStoreProvider } from '@/lib/course-store'
import { APICacheProvider } from '@/lib/api-cache'
import { PrefetchCommonRoutes } from '@/lib/prefetch'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LearnSphere - Professional eLearning Platform',
  description: 'Master new skills with expert-led courses. Join thousands of learners and instructors on the most comprehensive eLearning platform.',
  keywords: ['eLearning', 'online courses', 'education', 'skill development', 'professional training', 'certifications'],
  authors: [{ name: 'LearnSphere Team' }],
  creator: 'LearnSphere',
  publisher: 'LearnSphere Inc.',
  metadataBase: new URL('https://learnsphere.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://learnsphere.com',
    siteName: 'LearnSphere',
    title: 'LearnSphere - Professional eLearning Platform',
    description: 'Master new skills with expert-led courses. Join thousands of learners and instructors.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LearnSphere - Professional eLearning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LearnSphere - Professional eLearning Platform',
    description: 'Master new skills with expert-led courses. Join thousands of learners and instructors.',
    images: ['/og-image.png'],
    creator: '@learnsphere',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'verification-token-here',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClerkProviderWrapper>
          <APICacheProvider>
            <ThemeProvider>
              <AuthProvider>
                <CourseStoreProvider>
                  {children}
                  <Toaster />
                  <PrefetchCommonRoutes />
                </CourseStoreProvider>
              </AuthProvider>
            </ThemeProvider>
          </APICacheProvider>
        </ClerkProviderWrapper>
      </body>
    </html>
  )
}

