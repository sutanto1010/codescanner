import Vue from 'vue';

Vue.directive('thousand-separator', {
  bind(el, _, vnode) {
    el.addEventListener('input', (e) => {
      const amt = (e.target as HTMLTextAreaElement).value.toString();
      if (amt !== '0') {
        const formatted = amt.replace(/\D/g, "")
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        vnode.componentInstance!.$emit('input', formatted);
      } else {
        vnode.componentInstance!.$emit('input', amt);
      }
    })
  }
});
