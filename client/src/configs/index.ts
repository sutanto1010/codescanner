import time from './time'
import icons from './icons'
// @ts-ignore
import theme from './theme'
// @ts-ignore
import toolbar from './toolbar'
// @ts-ignore
import locales from './locales'
// @ts-ignore
import currencies from './currencies'
// @ts-ignore
import navigation from './navigation'

export default {
  // product display information
  product: {
    name: 'Code Scanner',
    version: process.env.VUE_APP_VERSION
  },

  // time configs
  time,

  // icon libraries
  icons,

  // theme configs
  theme,

  // toolbar configs
  toolbar,

  // locales configs
  locales,

  // currencies configs
  currencies,

  // navigation configs
  navigation
}
