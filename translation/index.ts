import * as Localization from 'expo-localization';

import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enUK from '@/translation/enUK';
import ptBr from '@/translation/ptBr';

const resources = {
  'pt-BR': { translation: ptBr },
  'en-UK': { translation: enUK },
  'en-BR': { translation: enUK },
};

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem('language');

  if (!savedLanguage) {
    savedLanguage = Localization.getLocales()[0].languageTag;
  }

  i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage ?? 'pt-BR',
    fallbackLng: 'pt-BR',
    interpolation: {escapeValue: false,},
  });
};

initI18n();

export default i18n;
