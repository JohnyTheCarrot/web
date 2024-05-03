import './globals.css';
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@repo/utils';
import { Providers } from './providers';
import { Nunito_Sans } from 'next/font/google';

const fontSans = Nunito_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://storybook.js.org'),
  title: 'Storybook: Frontend workshop for UI development',
  description:
    "Storybook is a frontend workshop for building UI components and pages in isolation. Thousands of teams use it for UI development, testing, and documentation. It's open source and free.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-white dark:bg-zinc-900 font-sans antialiased',
          fontSans.variable,
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
