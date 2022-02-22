import configs from '../../configs'
import actions from './actions'
import mutations from './mutations'
const { product, time, theme, currencies  } = configs
const { globalTheme, menuTheme, toolbarTheme, isToolbarDetached, isContentBoxed, isRTL } = theme
const { currency, availableCurrencies } = currencies
let user:any={}
let local:any={}
const state = {
  drawerMiniVariant: true,
  showDrawer: true,
  isOffline:false,
  isSyncing:false,
  product,
  time:"YYYY-MM-DD HH:mm:ss",
  currency,
  availableCurrencies,
  globalTheme,
  menuTheme,
  toolbarTheme,
  local,
  info: {
    type:"error",
    title:"",
    body:"",
    visible: false,
    textColor: '#E81123',
    icon:"",
  },
  isToolbarDetached,
  isContentBoxed,
  isRTL,
  user,
  toast: {
    show: false,
    message: '',
    timeout: 3000,
  },
  archConfirm:{
    icons:{
      "info": {
        icon: "fas fa-info-circle",
        color: "rgb(97 90 90)"
      },
      "warning": {
        icon: "fas fa-exclamation-circle",
        color: "rgb(232 186 44)"
      },
      "success": {
        icon:"mdi-check",
        color:"#366436"
      },
    },
    type:"info",
    title:null,
    message:"message",
    yes:"Yes",
    no:"No",
    show: false,
    closing: false,
    onYesCallback:null,
    onNoCallback:null
  },
  window:{
    width:-1,
    height:-1,
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
