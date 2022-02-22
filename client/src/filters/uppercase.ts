import Vue from 'vue'

Vue.filter('uppercase', (value:string) => {
  if (!value) return ''

  return value.toString().toUpperCase()
})
