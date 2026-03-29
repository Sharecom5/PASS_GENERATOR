import './globals.css'

export const metadata = {
  title: 'Event Pass System',
  description: 'Event Management and Registration',
  icons: {
    icon: '/favicon.ico',
  },
}

import { Providers } from '@/components/Providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
