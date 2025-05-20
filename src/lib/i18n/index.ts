
'use client';

import React, { ReactNode } from 'react';

// Assuming en.i18n.json is in the same directory
import enTranslations from './en.i18n.json';

const translations: Record<string, Record<string, string>> = {
  en: enTranslations,
  // Other languages would be imported and added here
  // Example:
  // import esTranslations from './es.i18n.json';
  // es: esTranslations,
};

export type LanguageCode = keyof typeof translations;

export interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, params?: Record<string, string | number | undefined>) => string;
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = React.useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('kanbanai-lang') as LanguageCode;
      return savedLang && translations[savedLang] ? savedLang : 'en';
    }
    return 'en'; // Default language
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
      // Fallback to English if the selected language's translations aren't found
      setLanguageState('en');
      setCurrentTranslations(translations.en);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kanbanai-lang', 'en');
      }
      console.warn(`Translations for language "${lang}" not found. Falling back to English.`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // setLanguageState and setCurrentTranslations are stable

  // Effect to update translations if the language changes externally (e.g., localStorage initialization)
  React.useEffect(() => {
    const savedLang = (typeof window !== 'undefined' ? localStorage.getItem('kanbanai-lang') : 'en') as LanguageCode;
    if (savedLang && translations[savedLang]) {
      if (language !== savedLang) { // Only update if different
        setLanguage(savedLang);
      }
    } else if (language !== 'en') { // If invalid saved lang, fallback to 'en'
        setLanguage('en');
    }
  }, [language, setLanguage]);

  const t = React.useCallback((key: string, params?: Record<string, string | number | undefined>): string => {
    let translation = currentTranslations[key] || key; // Fallback to key if translation not found

    if (params) {
      // Replace __param__ style placeholders
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        if (paramValue !== undefined) {
          translation = translation.replace(new RegExp(`__${paramKey}__`, 'g'), String(paramValue));
          // Also support {param} style placeholders
          translation = translation.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
        }
      });
      
      // Replace %s style placeholders sequentially
      if (typeof params === 'object' && params !== null) {
        let paramIndex = 0;
        const paramKeys = Object.keys(params); // Maintain order for %s if params is an object
        translation = translation.replace(/%s/g, () => {
          const val = paramIndex < paramKeys.length ? params[paramKeys[paramIndex++]] : undefined;
          return val !== undefined ? String(val) : '%s';
        });
      }
    }
    return translation;
  }, [currentTranslations]);

  const providerValue = { language, setLanguage, t };

  return (
    <LanguageContext.Provider value={providerValue}>
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
