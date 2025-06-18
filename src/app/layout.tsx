import './globals.css'; // 👈 Cette ligne est cruciale !
import Providers from './providers';

export const metadata = {
  title: 'Omnia',
  description: 'App',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

