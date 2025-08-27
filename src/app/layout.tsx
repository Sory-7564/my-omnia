 import './globals.css'
import Providers from './providers'
import ClientLayout from './client-layout'

export const metadata = {
  title: 'Omnia',
  description: 'App',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-zinc-950 text-white">
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  )
}


