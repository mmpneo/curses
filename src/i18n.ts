import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend, {HttpBackendOptions} from 'i18next-http-backend';

declare global {
  interface Window {
    $t: typeof i18n['t']
  }
}

i18n
  // load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
  // learn more: https://github.com/i18next/i18next-http-backend
  // want your translations to be loaded from a professional CDN? => https://github.com/locize/react-tutorial#step-2---use-the-locize-cdn
  .use(Backend)
  .use(initReactI18next)
  .init<HttpBackendOptions>({
    backend: {
      loadPath: '/i18n/{{lng}}/{{ns}}.json'
    },
    preload: ['en'],
    supportedLngs: ['en'],
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false
    }
  });
window.$t = i18n.t;

export const i18nLanguages = [
  {
    name: 'English',
    code: 'en'
  }
]

export default i18n;