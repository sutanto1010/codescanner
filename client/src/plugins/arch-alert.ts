import { VueConstructor } from "vue";
import ArchAlert from '@/components/common/ArchAlert.vue';
import vuetify from "@/plugins/vuetify";

type AlertArchType = 'warn' | 'success' | 'confirm';

export interface IArchAlert {
  title?: string;
  message?: string;
  type?: AlertArchType;
  confirmButtonText?: string;
  cancelButtonText?: string;
  width?: number | string;
  persistent?: boolean;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
}
declare module 'vue/types/vue' {
  interface Vue {
    $archConfirm: (args: IArchAlert) => Promise<void>;
  }
}
const archAlertPlugins = {
  install(Vue: VueConstructor) {
    Vue.prototype.$archConfirm = function (args: IArchAlert): Promise<void> {
      const ComponentClass = Vue.extend(ArchAlert);
      const instance = new ComponentClass({
        vuetify,
        propsData: {
          title: args.title,
          message: args.message,
          type: args.type,
          confirmButtonText: args.confirmButtonText,
          cancelButtonText: args.cancelButtonText,
          width: args.width,
          persistent: args.persistent,
          confirmButtonColor: args.confirmButtonColor,
          cancelButtonColor: args.cancelButtonColor,
        },
      });
      instance.$mount();
      const app = document.getElementById('app')!;
      app.appendChild(instance.$el);
      return new Promise((resolve, reject) => {
        instance.$on('confirm', () => {
          resolve();
          setTimeout(() => {
            instance.$destroy();
          }, 1000);
        });
        instance.$on('cancel', () => {
          reject();
          setTimeout(() => {
            instance.$destroy();
          }, 1000)
        });
      });
    }
  },
};

export default archAlertPlugins;
