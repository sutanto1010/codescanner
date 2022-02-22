import Vue from 'vue'

Vue.filter('lowercase', (value:string) => {
  if (!value) return ''

  return value.toString().toLowerCase()
})
