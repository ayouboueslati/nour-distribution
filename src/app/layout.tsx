//C:\Users\ayoub\nour-distribution\frontend\src\app\layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import { CartProvider } from './context/CartContext'
import LayoutContent from './components/LayoutContent'
import { AuthProvider } from './context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nour Distribution - Cheveux de Tresse Africaine',
  description: 'Distribution professionnelle de cheveux de tresse africaine B2B et B2C',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <LayoutContent>{children}</LayoutContent>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}