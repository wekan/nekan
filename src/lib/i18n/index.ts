
// src/lib/i18n/index.ts
'use client';

import React, { ReactNode } from 'react'; // Explicitly import React and ReactNode

// Assuming enTranslations is the structure for all translations
import enTranslations from './en.i18n.json';

// For now, we only have English. In a real app, this would involve dynamic imports.
const translations: Record<string, Record<string, string>> = {
  en: enTranslations,
  // Other language translations would be added here if available
};

export type LanguageCode = keyof typeof translations;

type LanguageContextType = {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, params?: Record<string, string | number | undefined>) => string;
};

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = React.useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('kanbanai-lang') as LanguageCode;
      return savedLang && translations[savedLang] ? savedLang : 'en';
    }
    return 'en';
  });

  const [currentTranslations, setCurrentTranslations] = React.useState<Record<string, string>>(
    () => translations[language] || translations.en
  );

  const setLanguage = React.useCallback((lang: LanguageCode) => {
    if (translations[lang]) {
      setLanguageState(lang);
      setCurrentTranslations(translations[lang]);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kanbanai-lang', lang);
      }
    } else {
      setLanguageState('en');
      setCurrentTranslations(translations.en);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kanbanai-lang', 'en');
      }
      console.warn(`Translations for language "${lang}" not found. Falling back to English.`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // setLanguageState and setCurrentTranslations from useState are stable

  React.useEffect(() => {
    const savedLang = (typeof window !== 'undefined' ? localStorage.getItem('kanbanai-lang') : 'en') as LanguageCode;
    if (savedLang && translations[savedLang]) {
      if (language !== savedLang) {
        setLanguage(savedLang);
      }
    } else if (language !== 'en') {
        setLanguage('en');
    }
  }, [language, setLanguage]);

  const t = React.useCallback((key: string, params?: Record<string, string | number | undefined>): string => {
    let translation = currentTranslations[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        if (paramValue !== undefined) {
          translation = translation.replace(new RegExp(`__${paramKey}__`, 'g'), String(paramValue));
          translation = translation.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
        }
      });
      
      if (typeof params === 'object' && params !== null) {
        let paramIndex = 0;
        const paramKeys = Object.keys(params); 
        translation = translation.replace(/%s/g, () => {
          const val = params[paramKeys[paramIndex++]];
          return val !== undefined ? String(val) : '%s';
        });
      }
    }
    return translation;
  }, [currentTranslations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = React.useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
