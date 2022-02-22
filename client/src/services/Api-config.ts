const config = {
  BASE_API_URL:process.env.VUE_APP_BASE_API_URL,
  IS_ONLINE_URL:process.env.VUE_APP_IS_ONLINE_URL,
  WS_URL:process.env.VUE_APP_WS_URL,
  STORAGE_KEYS:{
    TOKEN:'token',
    PREV_PAGE: 'prev',
    NEXT_PAGE:'next'
  }
}

export default config
