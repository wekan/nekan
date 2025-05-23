import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { I18nProvider } from '@/lib/i18n'; // Import I18nProvider
import { headers } from 'next/headers'; // For reading headers server-side
import fs from 'fs/promises';
import path from 'path';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Metadata can't use hooks directly, so we'll handle dynamic titles/descriptions
// differently if needed, or keep them static if globally applicable.
// For now, let's assume these are static or will be handled within page components.
export const metadata: Metadata = {
  title: 'KanbanAI', // This will be static unless we move I18nProvider higher or handle differently
  description: 'AI-Powered Kanban Board for optimal workflow efficiency.', // t('metaDescription')
};

async function getInitialLocaleData() {
  // Dynamically determine available locales by reading the /public/locales directory
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

  // TODO: Add logic to check user profile for saved language preference here
  // This would typically involve fetching user data if a session exists.
  // If user profile language is found and valid, it should override acceptLanguage.
  // For example:
  // const userProfileLang = await getUserProfileLang(); // Fictional function
  // if (userProfileLang && availableLocales.includes(userProfileLang)) {
  //   preferredLocale = userProfileLang;
  // } else if (acceptLanguage) { ... }

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

function LayoutContent({ children, lang }: { children: React.ReactNode, lang: string }) {
  // If you need to translate metadata dynamically based on language,
  // you would typically do this at the page level or use a more advanced i18n setup.
  // For simplicity, we'll keep the static metadata for now.
  // const { t } = useTranslation();
  // metadata.title = t('metaTitle');
  // metadata.description = t('metaDescription');

  return (
    <html lang={lang}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, messages } = await getInitialLocaleData();

  // Explicitly define the props for I18nProvider
  const i18nProviderProps = {
    initialLocale: locale,
    initialMessages: messages,
    children: <LayoutContent lang={locale}>{children}</LayoutContent>,
  };

  return (
    // @ts-expect-error TODO: Investigate why I18nProvider props are not recognized despite being defined
    <I18nProvider {...i18nProviderProps} />
  );
}
