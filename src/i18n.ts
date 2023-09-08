import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend, {HttpBackendOptions} from 'i18next-http-backend';

export const i18nLanguages = [
  {
    name: 'English',
    code: 'en'
  }
]

export function changeLanguage(language: string) {
  i18n.changeLanguage(language);
}

export async function initI18n(selectedLanguage: string) {
  const lngCodes = i18nLanguages.map(l => l.code);
  return i18n
    .use(Backend)
    .use(initReactI18next)
    .init<HttpBackendOptions>({
      backend: {
        loadPath: '/i18n/{{lng}}/{{ns}}.json'
      },
      preload: [...lngCodes, selectedLanguage],
      supportedLngs: lngCodes,
      fallbackLng: lngCodes[0] || 'en',
      debug: import.meta.env.TAURI_DEBUG,
      lng: selectedLanguage,
      
      interpolation: {
        escapeValue: false
      }
    });
}
