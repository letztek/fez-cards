import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zh from './locales/zh.json';
import en from './locales/en.json';
import ja from './locales/ja.json';

const resources = {
  zh: {
    translation: zh
  },
  en: {
    translation: en
  },
  ja: {
    translation: ja
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh',
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    
    detection: {
      // 檢測順序
      order: ['localStorage', 'navigator', 'htmlTag'],
      
      // 在localStorage中的key名稱
      lookupLocalStorage: 'fez-card-language',
      
      // 快取用戶語言
      caches: ['localStorage']
    }
  });

export default i18n;