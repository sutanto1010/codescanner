// @ts-nocheck
import Vue from 'vue'
Vue.directive('uppercase', {
  bind (el, _, vnode) {
    el.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase()
      vnode.componentInstance.$emit('input', e.target.value.toUpperCase())
    })
  }
})


Vue.directive('modal-content', {
  bind (el, _, vnode) {
   let store = vnode.context.$store 
   el.style.height=(store.state.app.window.height-383)+"px"
   el.style.overflow="auto"
   store.watch(()=> store.state.app.window.height, (h)=> {
     el.style.height=(h-383)+"px"
     el.style.overflow="auto"
   })
  }
})