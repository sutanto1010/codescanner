import Vue from 'vue'

Vue.filter('formatTime', (value:string) => {
  if (!value) return ''
  if(value.length>5)
    return value.toString().substr(11, 5)
  return value
})
