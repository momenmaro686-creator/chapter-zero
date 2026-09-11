import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'CHAPTER ZERO - What is the story?',
  description: 'Fashion/lifestyle brand exploring mystery and narrative through drops and lore.',
  metadataBase: new URL('https://chapter-zero.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://chapter-zero.com',
    siteName: 'CHAPTER ZERO',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className="bg-black text-white">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
