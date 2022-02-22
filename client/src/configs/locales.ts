//@ts-nocheck
import en from '../translations/en'
import id from '../translations/id'
const supported = ['en', 'id']
let locale = 'en'
try {
  const { 0: browserLang } = navigator.language.split('-')
  if (supported.includes(browserLang)) locale = browserLang
} catch (e) {
  console.log(e)
}

export default {
  locale,
  fallbackLocale: 'en',
  availableLocales: [{
    code: 'en',
    flag: 'us',
    label: 'English',
    messages: en,
    thousands_separator:",",
    decimal_separator:"."
  }, {
    code: 'id',
    flag: 'id',
    label: 'Indonesia',
    messages: id,
    thousands_separator:".",
    decimal_separator:","
  }]
}
