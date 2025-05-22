'use client';

import React, { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';

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

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('kanbanai-lang') as LanguageCode;
      return savedLang && translations[savedLang] ? savedLang : 'en';
    }
    return 'en'; // Default language
  });

  const [currentTranslations, setCurrentTranslations] = useState<Record<string, string>>(
    () => translations[language] || translations.en
  );

  // Effect to update currentTranslations when the language state changes
  useEffect(() => {
    setCurrentTranslations(translations[language] || translations.en);
  }, [language]);

  const setLanguage = useCallback((lang: LanguageCode) => {
    if (translations[lang]) {
      setLanguageState(lang);
      // currentTranslations will be updated by the useEffect hook above
      if (typeof window !== 'undefined') {
        localStorage.setItem('kanbanai-lang', lang);
      }
    } else {
      setLanguageState('en');
      // currentTranslations will be updated by the useEffect hook above
      if (typeof window !== 'undefined') {
        localStorage.setItem('kanbanai-lang', 'en');
      }
      console.warn("Translations for language " + lang + " not found. Falling back to English.");
    }
  }, []); // setLanguageState is stable

  const t = useCallback((key: string, params?: Record<string, string | number | undefined>): string => {
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
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
