import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Squashie — Find your squash community in Singapore',
    template: '%s | Squashie',
  },
  description:
    'Compare squash clubs and communities in Singapore by access, cost, training, level, and location.',
  openGraph: {
    title: 'Squashie — Find your squash community in Singapore',
    description: 'Compare access, costs, playing levels, training, and joining steps across Singapore squash communities.',
    type: 'website',
    locale: 'en_SG',
    images: [{ url: '/og.png', width: 1734, height: 908, alt: 'Squashie — Find your squash community in Singapore' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Squashie — Find your squash community in Singapore',
    description: 'Compare access, costs, playing levels, training, and joining steps across Singapore squash communities.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
