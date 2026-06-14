import type { Metadata } from 'next'
import { Nunito, Inter, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'EnglishForge — Where Children Learn English and Love It',
    template: '%s | EnglishForge',
  },
  description:
    '100 levels of fun, gamified English education for ages 5–15. Quizzes, badges, live classes, and AI-powered learning.',
  keywords: ['english learning', 'kids education', 'gamified learning', 'pakistan education'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-text-primary font-body">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '1rem',
              fontFamily: 'var(--font-inter)',
            },
          }}
        />
      </body>
    </html>
  )
}
