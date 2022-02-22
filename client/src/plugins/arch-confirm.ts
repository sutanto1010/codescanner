import Vue, {VueConstructor} from "vue";
import app from "@/store/app/"
export type ArchAlertType = 'success' | 'error' | 'warning' | 'info' | 'question';
let _confirm = (
  message: string,
  title?: string,
  type?: ArchAlertType,
  onYesCallback?:any,
  onNoCallback?:any) => {
  app.state.archConfirm.message=message
  // @ts-ignore
  app.state.archConfirm.type=type
  // @ts-ignore
  app.state.archConfirm.title=title
  app.state.archConfirm.closing=false
  app.state.archConfirm.show=true
  app.state.archConfirm.onNoCallback=onNoCallback
  app.state.archConfirm.onYesCallback=onYesCallback
}

declare module 'vue/types/vue' {
  interface Vue {
    $confirm: typeof _confirm
  }
}

Vue.use((vue:VueConstructor)=>{
  vue.prototype.$confirm=_confirm
})


