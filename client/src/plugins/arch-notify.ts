import Vue, { VueConstructor } from "vue";
import ArchNotifications from "@/components/common/ArchNotifications.vue";
import vuetify from "@/plugins/vuetify";

type ArchNotifyType = 'error' | 'success' | 'warn';

interface IArchNotify {
  message?: string;
  confirmButtonText?: string;
  color?: ArchNotifyType;
  width?: number | string;
  timeout?: number | string;
  showClose?: boolean;
  useHTML?: boolean;
}

declare module 'vue/types/vue' {
  interface Vue {
    $archNotify: (args: IArchNotify) => void;
  }
}

export const ArchNotify = (args: IArchNotify) => {
  const ComponentClass = Vue.extend(ArchNotifications);
  const instance = new ComponentClass({
    vuetify,
    propsData: args,
  });
  instance.$mount();
  const app = document.getElementById('app')!;
  app.appendChild(instance.$el);
  setTimeout(() => {
    instance.$destroy();
    app.removeChild(instance.$el);
  }, 5000);
};

export default function archNotifyPlugin(Vue: VueConstructor): void {
  Vue.prototype.$archNotify = ArchNotify;
}
