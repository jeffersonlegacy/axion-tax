import React, { useMemo, useState } from 'react';
import { translations } from '../translations/translations';
import { LanguageContext } from './language-context';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    if (typeof window === 'undefined') return 'en';
    const saved = window.localStorage.getItem('axion-language');
    return saved === 'es' ? 'es' : 'en';
  });
  const [copyMode, setCopyMode] = useState(() => {
    if (typeof window === 'undefined') return 'explained';
    const saved = window.localStorage.getItem('axion-copy-mode');
    return saved === 'basic' ? 'basic' : 'explained';
  });

  const value = useMemo(() => {
    const t = (path) => {
      const keys = path.split('.');
      let result = translations[language];
      for (const key of keys) {
        if (result && result[key]) {
          result = result[key];
        } else {
          return path;
        }
      }
      return result;
    };

    const toggleLanguage = () => {
      setLanguage(prev => prev === 'en' ? 'es' : 'en');
    };

    const toggleCopyMode = () => {
      setCopyMode((prev) => (prev === 'explained' ? 'basic' : 'explained'));
    };

    const pickCopy = (en, es, basicEn = en, basicEs = es) => {
      if (language === 'es') {
        return copyMode === 'basic' ? basicEs : es;
      }
      return copyMode === 'basic' ? basicEn : en;
    };

    return { language, setLanguage, toggleLanguage, copyMode, setCopyMode, toggleCopyMode, pickCopy, t };
  }, [copyMode, language]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('axion-language', language);
    document.documentElement.lang = language === 'es' ? 'es' : 'en';
  }, [language]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('axion-copy-mode', copyMode);
    document.documentElement.dataset.copyMode = copyMode;
  }, [copyMode]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
