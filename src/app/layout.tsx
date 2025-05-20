import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { I18nProvider, useTranslation } from '@/lib/i18n'; // Import I18nProvider

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
  title: 'KanbanAI', // This could be t('metaTitle') if context was available here
  description: 'AI-Powered Kanban Board for optimal workflow efficiency.', // t('metaDescription')
};

function LayoutContent({ children }: { children: React.ReactNode }) {
  // If you need to translate metadata dynamically based on language,
  // you would typically do this at the page level or use a more advanced i18n setup.
  // For simplicity, we'll keep the static metadata for now.
  // const { t } = useTranslation();
  // metadata.title = t('metaTitle');
  // metadata.description = t('metaDescription');

  return (
    <html lang="en"> {/* Consider making lang dynamic based on i18n state */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <I18nProvider>
      <LayoutContent>{children}</LayoutContent>
    </I18nProvider>
  );
}
