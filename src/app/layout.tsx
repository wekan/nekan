import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { I18nProvider, type I18nProviderProps as TI18nProviderProps } from '@/lib/i18n';
import { headers } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';
import LayoutContentClient from './layout-content'; // Import the client component

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'KanbanAI',
  description: 'AI-Powered Kanban Board for optimal workflow efficiency.',
};

async function getInitialLocaleData() {
  let availableLocales: string[] = ['en']; // Default with 'en'
  try {
    const localesDir = path.join(process.cwd(), 'public', 'locales');
    const files = await fs.readdir(localesDir);
    availableLocales = files
      .filter(file => file.endsWith('.i18n.json'))
      .map(file => file.replace('.i18n.json', ''));
    if (!availableLocales.includes('en')) { // Ensure 'en' is always an option if present
        const enExists = files.some(file => file === 'en.i18n.json');
        if (enExists) availableLocales.push('en');
        else if (availableLocales.length === 0) availableLocales = ['en']; // Critical fallback if dir is empty or no .json files
    }
  } catch (error) {
    console.warn('Failed to read available locales dynamically, falling back to default [\'en\']:', error);
    // availableLocales remains ['en']
  }

  const requestHeaders = await headers(); // Correctly get headers object by awaiting
  const acceptLanguage = requestHeaders.get('accept-language');
  let preferredLocale = 'en'; // Default locale

  if (acceptLanguage) {
    const langs = acceptLanguage
      .split(',')
      .map((langEntry: string) => {
        const parts = langEntry.split(';');
        const langCode = parts[0].trim();
        let q = 1.0;
        if (parts[1]) {
          const qMatch = parts[1].match(/q=([0-9.]+)/);
          if (qMatch) {
            q = parseFloat(qMatch[1]);
          }
        }
        return { code: langCode, q };
      })
      .sort((a: { code: string; q: number }, b: { code: string; q: number }) => b.q - a.q); // Sort by quality factor

    for (const lang of langs) {
      if (availableLocales.includes(lang.code)) {
        preferredLocale = lang.code;
        break;
      }
      const baseLang = lang.code.split('-')[0];
      if (availableLocales.includes(baseLang)) {
        preferredLocale = baseLang;
        break;
      }
    }
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'locales', `${preferredLocale}.i18n.json`);
    const fileContents = await fs.readFile(filePath, 'utf8');
    const messages = JSON.parse(fileContents);
    return { locale: preferredLocale, messages };
  } catch (e) {
    console.warn(`Initial locale file for ${preferredLocale} not found, falling back to en. Error: ${e}`);
    try {
        const fallbackFilePath = path.join(process.cwd(), 'public', 'locales', 'en.i18n.json');
        const fallbackFileContents = await fs.readFile(fallbackFilePath, 'utf8');
        const fallbackMessages = JSON.parse(fallbackFileContents);
        return { locale: 'en', messages: fallbackMessages };
    } catch (enError) {
        console.error("Failed to load English fallback translations for SSR:", enError);
        return { locale: 'en', messages: {} }; // Critical fallback: no messages
    }
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, messages } = await getInitialLocaleData();

  const fontVariables = `${geistSans.variable} ${geistMono.variable}`;

  const i18nProviderProps: TI18nProviderProps = {
    initialLocale: locale,
    initialMessages: messages,
    children: (
      <LayoutContentClient lang={locale} fontClassName={fontVariables}>
        {children}
      </LayoutContentClient>
    ),
  };

  return (
    <I18nProvider {...i18nProviderProps} />
  );
}
