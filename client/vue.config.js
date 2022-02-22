var fs = require("fs")
process.env.VUE_APP_VERSION = require('./package.json').version
module.exports = {
  pages:{
    index:{
      entry: 'src/main.ts',
      template:`public/index.${process.env.NODE_ENV}.html`,
      title:'WA'
    }
  },
  pluginOptions: {

  },
  pwa: {
    name: 'Code Scanner',
    themeColor: '#4DBA87',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    //workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      navigateFallback: 'index.html',
      //swSrc:"src/service-worker.js"
    }
  },
  // https://cli.vuejs.org/config/#productionsourcemap
  productionSourceMap: false,

  // https://cli.vuejs.org/config/#css-extract
  css: {
    extract: { ignoreOrder: true },
    loaderOptions: {
      sass: {
        prependData: '@import \'~@/assets/scss/vuetify/variables\''
      },
      scss: {
        prependData: '@import \'~@/assets/scss/vuetify/variables\';'
      }
    }
  },

  chainWebpack: (config) => {
    // Remove the following lines to add Vue Prefetch and Preload on index.html
    // https://cli.vuejs.org/guide/html-and-static-assets.html#disable-index-generation
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')

  },

  // https://cli.vuejs.org/config/#transpiledependencies
  transpileDependencies: [
    'resize-detector',
    'vuetify'
  ],

}
