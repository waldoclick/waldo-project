import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Dashboard - Waldo.click®',
  description: 'Panel de administración de Waldo.click®',
  authors: [{ name: 'Waldo.click®' }],
  publisher: 'Waldo.click®',
  icons: {
    icon: [
      { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicons/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      {
        url: '/favicons/android-icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
    apple: [
      { url: '/favicons/apple-icon-57x57.png', sizes: '57x57' },
      { url: '/favicons/apple-icon-60x60.png', sizes: '60x60' },
      { url: '/favicons/apple-icon-72x72.png', sizes: '72x72' },
      { url: '/favicons/apple-icon-76x76.png', sizes: '76x76' },
      { url: '/favicons/apple-icon-114x114.png', sizes: '114x114' },
      { url: '/favicons/apple-icon-120x120.png', sizes: '120x120' },
      { url: '/favicons/apple-icon-144x144.png', sizes: '144x144' },
      { url: '/favicons/apple-icon-152x152.png', sizes: '152x152' },
      { url: '/favicons/apple-icon-180x180.png', sizes: '180x180' },
    ],
  },
  other: {
    'msapplication-TileImage': '/favicons/ms-icon-144x144.png',
    'msapplication-TileColor': '#ffffff',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className={`${poppins.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
