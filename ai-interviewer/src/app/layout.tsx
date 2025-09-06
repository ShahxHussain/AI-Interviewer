import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { AuthProvider } from '@/hooks/useAuth';
import './globals.css';
import '../styles/dashboard-theme.css';

const inter = Inter({
  variable: '--font-primary',
  subsets: ['latin'],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI-Interviewer',
  description: 'Practice interviews with AI-powered interviewers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased`}
        style={{ fontFamily: 'var(--font-primary)' }}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
