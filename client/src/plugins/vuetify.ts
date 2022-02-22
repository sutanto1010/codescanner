import Vue from 'vue'

// For full framework
// @ts-ignore
//import Vuetify from 'vuetify/lib/framework'
// For a-la-carte components - https://vuetifyjs.com/en/customization/a-la-carte/
import Vuetify from 'vuetify/lib'

import * as directives from 'vuetify/lib/directives'
import i18n from './vue-i18n'
import config from '../configs'
import '@fortawesome/fontawesome-free/css/all.min.css';

export type VForm = Vue & {
  validate: () => boolean;
  resetValidation: () => boolean;
  reset: () => void;
}

Vue.use(Vuetify, {
  directives,
  iconfont: 'fas'
})

export default new Vuetify({
  rtl: config.theme.isRTL,
  theme: {
    dark: config.theme.globalTheme === 'dark',
    options: {
      customProperties: true
    },
    themes: {
      dark: config.theme.dark,
      light: config.theme.light
    }
  },
  lang: {
    current: config.locales.locale,
    // To use Vuetify own translations without Vue-i18n comment the next line
    // @ts-ignore
    t: (key, ...params) => i18n.t(key, params)
  }
})
