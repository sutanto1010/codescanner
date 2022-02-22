// @ts-nocheck
const showToast = ({ state, commit }, message:string) => {
  if (state.toast.show) commit('hideToast')

  setTimeout(() => {
    commit('showToast', {
      color: 'black',
      message,
      timeout: 3000
    })
  })
}

const showError = ({ state, commit }, { message = 'Failed!', error }) => {
  if (state.toast.show) commit('hideToast')

  setTimeout(() => {
    commit('showToast', {
      color: 'error',
      message: message + ' ' + error.message,
      timeout: 10000
    })
  })
}

const showSuccess = ({ state, commit }, message:string) => {
  if (state.toast.show) commit('hideToast')
  setTimeout(() => {
    commit('showToast', {
      color: 'success',
      message,
      timeout: 3000
    })
  })
}


async function setSyncing({commit}, isSyncing) {
  commit("setSyncing", isSyncing)
}

export default {
  showToast,
  showError,
  showSuccess,
  setSyncing
}
