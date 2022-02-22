// @ts-nocheck
import Vuetify from '../../plugins/vuetify'

export default {
  /**
   * Main Toast
   */
  showToast: (state:any, toast:any) => {
    const { color, timeout, message } = toast

    state.toast = {
      message,
      color,
      timeout,
      show: true
    }
  },
  hideToast: (state:any) => {
    state.toast.show = false
  },
  resetToast: (state:any) => {
    state.toast = {
      show: false,
      color: 'black',
      message: '',
      timeout: 3000
    }
  },
  setSyncing: (state: any, isSyncing: boolean) => {
    state.isSyncing = isSyncing
  },

  /**
   * Theme and Layout
   */
  setGlobalTheme: (state, theme) => {
    Vuetify.framework.theme.dark = theme === 'dark'
    state.globalTheme = theme
  },
  setRTL: (state, isRTL) => {
    Vuetify.framework.rtl = isRTL
    state.isRTL = isRTL
  },
  setContentBoxed: (state, isBoxed) => {
    state.isContentBoxed = isBoxed
  },
  setMenuTheme: (state, theme) => {
    state.menuTheme = theme
  },
  setToolbarTheme: (state, theme) => {
    state.toolbarTheme = theme
  },
  setTimeZone: (state, zone) => {
    state.time.zone = zone
  },
  setTimeFormat: (state, format) => {
    state.time.format = format
  },
  setCurrency: (state, currency) => {
    state.currency = currency
  },
  setToolbarDetached: (state, isDetached:boolean) => {
    state.isToolbarDetached = isDetached
  },
  setSelectedHotel(state, hotel){
    state.hotel=hotel
  },
  showHideMessage(state, showHide){
    state.info.visible=showHide
  },
  archConfirmCallback(state,param){
    if(param){
      state.archConfirm.closing=true
      setTimeout(()=>{
        state.archConfirm.show=false
        if(state.archConfirm.onYesCallback){
          state.archConfirm.onYesCallback()
        }
      }, 400)
    }else{
      state.archConfirm.show=false
      if(state.archConfirm.onNoCallback){
        state.archConfirm.onNoCallback()
      }
    }
  }
}
