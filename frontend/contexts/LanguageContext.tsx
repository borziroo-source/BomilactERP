import React, { createContext, useState, useContext, ReactNode, useEffect, PropsWithChildren } from 'react';
import { translations, Language } from '../translations';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('hu');

  // Update HTML lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, fallback?: string) => {
    // Return translation or fallback or key itself
    return translations[language][key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};