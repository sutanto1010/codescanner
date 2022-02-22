import Vue, {VueConstructor} from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import vuetify from './plugins/vuetify'
import i18n from './plugins/vue-i18n'
import './plugins/animate'
import './plugins/arch-confirm'
import './plugins/arch-set-title'
import './plugins/clipboard'
import './filters/capitalize'
import './filters/lowercase'
import './filters/uppercase'
import './filters/formatCurrency'
import './directives/uppercase';
import './directives/formatNumber';
import './filters/formatDate'
import './filters/formatTime'
import './assets/scss/theme.scss'
import 'animate.css/animate.min.css'
import 'typeface-quicksand/index.css'
import axiosPlugin from './services/Api'
import archAlertPlugins from "@/plugins/arch-alert";
import archNotifyPlugins from "@/plugins/arch-notify";
import "./registerServiceWorker";
import '@mdi/font/css/materialdesignicons.min.css'
import DatetimePicker from 'vuetify-datetime-picker'
 
Vue.use(DatetimePicker)
Vue.component('arch-data-table', ()=> import("./components/common/ArchDataTable.vue"))
Vue.component('vue-inline-text-editor', () => import('./components/common/vue-inline-text-editor.vue'));
Vue.use(axiosPlugin);
Vue.use(archAlertPlugins);
Vue.use(archNotifyPlugins);
Vue.config.productionTip = false
Vue.config.devtools = true
Vue.config.performance = true
export default new Vue({
  i18n,
  vuetify,
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')