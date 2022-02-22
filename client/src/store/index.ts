import Vue from 'vue'
import Vuex from 'vuex'

import repository from './repository'
import rule from './rule'
import AppModule from './app'
Vue.use(Vuex)
const store = new Vuex.Store({
  modules: {
    app: AppModule,
    repository,
    rule
  },
});

export default store
