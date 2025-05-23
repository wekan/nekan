'use client';

import React, { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';
import { languagesData, Language as AppLanguage } from '@/lib/languages'; // Import languagesData and Language type

// For now, LanguageCode is string. Consider creating a definitive list for type safety.
export type LanguageCode = string;

export interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, params?: Record<string, string | number | undefined>) => string;
  isLoading: boolean;
  isRTL: boolean; // Added isRTL flag
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export interface I18nProviderProps { // Add export keyword
  children: ReactNode;
  initialLocale?: LanguageCode;
  initialMessages?: Record<string, string>;
}

export const I18nProvider = ({ children, initialLocale, initialMessages }: I18nProviderProps) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (initialLocale) return initialLocale;
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('kanbanai-lang') as LanguageCode;
      if (savedLang) return savedLang;
      if (navigator.languages && navigator.languages.length) {
        for (const navLang of navigator.languages) {
          // const baseLang = navLang.split('-')[0];
          return navLang;
        }
      }
    }
    return 'en'; // Default language
  });

  const [currentTranslations, setCurrentTranslations] = useState<Record<string, string>>(() => {
    if (initialLocale === language && initialMessages) {
      return initialMessages;
    }
    return {};
  });
  const [isLoading, setIsLoading] = useState<boolean>(!initialMessages && !Object.keys(currentTranslations).length);

  const [isRTL, setIsRTL] = useState<boolean>(() => {
    const effectiveInitialLocale = initialLocale || (typeof window !== 'undefined' ? localStorage.getItem('kanbanai-lang') : null) || 'en';
    const langData = languagesData[effectiveInitialLocale] || languagesData[effectiveInitialLocale.split('-')[0]];
    return langData?.rtl === 'true';
  });

  useEffect(() => {
    const currentLangData = languagesData[language] || languagesData[language.split('-')[0]];
    const newIsRTL = currentLangData?.rtl === 'true';
    if (newIsRTL !== isRTL) { // Only set if changed to avoid unnecessary re-renders
        setIsRTL(newIsRTL);
    }

    const fetchTranslations = async (langToLoad: LanguageCode) => {
      // Skip fetching if initialMessages were provided for the current language
      if (langToLoad === initialLocale && initialMessages && Object.keys(initialMessages).length > 0) {
        setCurrentTranslations(initialMessages);
        setIsLoading(false);
        return;
      }

      // Skip fetching if translations are already loaded for the current language
      // (This check might be redundant if setCurrentTranslations({}) is used before fetch)
      if (Object.keys(currentTranslations).length > 0 && !initialMessages) {
          // This case implies translations were loaded for a *previous* language,
          // and now language changed, so we need to fetch new ones.
          // Or, initialMessages were not provided, and we haven't loaded yet.
      }


      setIsLoading(true);
      try {
        const response = await fetch(`/api/locales/${langToLoad}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch translations for ${langToLoad}: ${response.statusText}`);
        }
        const data: Record<string, string> = await response.json();
        setCurrentTranslations(data);
        if (typeof window !== 'undefined') {
            localStorage.setItem('kanbanai-lang', langToLoad);
        }
      } catch (error) {
        console.warn(`Error loading translations for ${langToLoad}. Falling back.`, error);
        // Fallback logic: try base language or English
        const baseLang = langToLoad.split('-')[0];
        if (baseLang !== langToLoad && baseLang !== 'en') {
          try {
            const fallbackResponse = await fetch(`/api/locales/${baseLang}`);
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              setCurrentTranslations(fallbackData);
              setLanguageState(baseLang); // Update language state to the fallback
               if (typeof window !== 'undefined') {
                 localStorage.setItem('kanbanai-lang', baseLang);
               }
              return; // Exit after successful fallback
            }
          } catch (fallbackError) {
            console.warn(`Error loading fallback translations for ${baseLang}.`, fallbackError);
          }
        }
        // Ultimate fallback to English if base language also fails or was English
        if (langToLoad !== 'en') { // Avoid infinite loop if 'en' fails
            const enResponse = await fetch('/api/locales/en');
            if (enResponse.ok) {
                const enData = await enResponse.json();
                setCurrentTranslations(enData);
            } else {
                 setCurrentTranslations({}); // No translations available
            }
            setLanguageState('en'); // Update language state to 'en'
            if (typeof window !== 'undefined') {
                localStorage.setItem('kanbanai-lang', 'en');
            }
        } else {
            setCurrentTranslations({}); // English failed, clear translations
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (language) {
        // Only fetch if we don't have initialMessages for the current language
        if (language === initialLocale && initialMessages && Object.keys(initialMessages).length > 0) {
            setCurrentTranslations(initialMessages);
            setIsLoading(false);
        } else {
            fetchTranslations(language);
        }
    }
  }, [language, initialLocale, initialMessages, isRTL]); // Added isRTL to dependency array

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    setCurrentTranslations({});
    setIsLoading(true);
    // RTL status will be updated by the useEffect when `language` changes.
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number | undefined>): string => {
    if (isLoading && !Object.keys(currentTranslations).length) {
      // Optionally return a loading indicator or the key itself
      // For SSR, if initialMessages are provided, isLoading should be false initially.
      return key; // Or '...' or some placeholder
    }
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
          const val = paramIndex < paramKeys.length ? params[paramKeys[paramIndex++]] : undefined;
          return val !== undefined ? String(val) : '%s';
        });
      }
    }
    return translation;
  }, [currentTranslations, isLoading]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading, isRTL }}>
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
