import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './lang/en.json';
import deTranslations from './lang/de.json';
import frTranslations from './lang/fr.json';
import lbTranslations from './lang/lu.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      de: { translation: deTranslations },
      fr: { translation: frTranslations },
      lu: { translation: lbTranslations },
    },
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;