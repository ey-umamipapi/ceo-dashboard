import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'UmamiPapi — CEO Dashboard',
  description: 'UmamiPapi CEO Dashboard · FY26',
  themeColor: '#111111',
  manifest: '/manifest.json',
  icons: {
    apple: '/icon.png',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'UmamiPapi CEO',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
