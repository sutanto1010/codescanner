import config from "@/services/Api-config";
import Vue, {VueConstructor} from "vue";
import configs from "../configs"
let setTitle = (title)=>{
  document.title=`${configs.product.name} - ${title}`
}
declare module 'vue/types/vue' {
  interface Vue {
    $setTitle: typeof setTitle
  }
}

Vue.use((vue:VueConstructor)=>{
  vue.prototype.$setTitle=setTitle
})


