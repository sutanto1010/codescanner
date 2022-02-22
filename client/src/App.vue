<template>
  <v-app>
    <div
      v-if="isOffline"
      class="animate__animated animate__slideInDown"
      style="
        position: fixed;
        z-index: 999;
        font-size: smaller;
        height: 25px;
        font-weight: bold;
        width: 100%;
        background: #d91e1e;
        padding: 3px;
        text-align: center;
        color: white;
      "
    >
      OFFLINE MODE
    </div>
    <component :is="currentLayout" v-if="isRouterLoaded">
      <transition name="fade" mode="out-in">
        <router-view />
      </transition>
    </component>
    <v-snackbar
      color="#F2F5F8"
      elevation="24"
      style="z-index: 999; position: fixed"
      timeout="-1"
      id="arch-error"
      :absolute="true"
      v-model="info.visible"
      :vertical="true"
      top
    >
      <div style="text-align: center; margin-bottom: 5px">
        <v-icon color="rgb(156 15 27)">{{ info.icon }}</v-icon>
      </div>
      <div
        style="text-align: center; color: rgb(156 15 27)"
        v-html="info.body"
      ></div>
      <template v-slot:action="{ attrs }">
        <v-btn
          color="indigo"
          text
          v-bind="attrs"
          @click="showHideMessage(false)"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-dialog v-model="archConfirm.show" persistent max-width="400">
      <v-card>
        <div style="text-align: center; padding: 10px">
          <v-icon size="30px" :color="archConfirmIcon.color">{{
            archConfirmIcon.icon
          }}</v-icon>
        </div>
        <div class="headline" style="text-align: center">
          {{ archConfirm.title }}
        </div>
        <v-card-text style="text-align: center">
          <div v-html="archConfirm.message"></div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="archConfirmCallback(false)">
            {{ archConfirm.no }}
          </v-btn>
          <v-btn text
            :loading="archConfirm.closing"
            color="primary"
            @click="archConfirmCallback(true)"
          >
            {{ archConfirm.yes }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>
<script>
import { mapState, mapMutations } from "vuex";
import app from "@/store/app/index";
import config from "./configs";
import defaultLayout from "./layouts/DefaultLayout";
import simpleLayout from "./layouts/SimpleLayout";
import errorLayout from "./layouts/ErrorLayout";
import { Api } from "@/services/Api";
import worker from "@/workers/Index";
async function connectionCheck() {
  app.state.isOffline = !(await Api.isOnline());
  setTimeout(async () => {
    await connectionCheck();
  }, 20000);
}
export default {
  components: {
    defaultLayout,
    simpleLayout,
    errorLayout,
  },
  data() {
    return {
      updateNotificationVisible: false,
      sw_registration: null,
    };
  },
  created() {
    document.addEventListener("swUpdated", this.showUpdateNotification, {
      once: true,
    });
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (this.refreshing) return;
        this.refreshing = true;
        window.location.reload();
      });
    }
  },
  computed: {
    ...mapState("app", [
      "toast",
      "info",
      "hotels",
      "archConfirm",
      "isOffline",
      "isSyncing",
    ]),
    isRouterLoaded: function () {
      if (this.$route.name !== null) return true;

      return false;
    },
    currentLayout: function () {
      const layout = this.$route.meta.layout || "default";

      return layout + "Layout";
    },
    archConfirmIcon() {
      let temp = this.archConfirm.icons["info"];

      return this.archConfirm.icons[this.archConfirm.type] || temp;
    },
  },
  head: {
    link: [...config.icons.map((href) => ({ rel: "stylesheet", href }))],
  },
  methods: {
    ...mapMutations("app", ["archConfirmCallback", "showHideMessage"]),
    showUpdateNotification(e) {
      this.sw_registration = e.detail;
      this.updateNotificationVisible = true;
    },
    updateApp() {
      this.updateNotificationVisible = false;
      if (!this.sw_registration || !this.sw_registration.waiting) {
        return;
      }
      this.sw_registration.waiting.postMessage("skipWaiting");
    },
  },
  async mounted() {
     app.state.window.width=window.innerWidth;
     app.state.window.height=window.innerHeight;
    await connectionCheck();
    window.addEventListener("offline", function (e) {
      app.state.isOffline = true;
      console.log("offline");
    });
    window.addEventListener("online", function (e) {
      app.state.isOffline = false;
      console.log("online");
    });
    window.addEventListener("resize", e => {
      app.state.window.width=e.target.outerWidth;
      app.state.window.height=e.target.outerHeight;
      //console.log(app.state.window)
    })
  },
  watch: {
    isOffline(newValue, oldValue) {
      if (!newValue && oldValue) {
        worker.Run();
      }
    },
    isSyncing(newValue) {
      if (newValue) {
        this.$archNotify({
          message: "Syncing pending requests!",
          color: "success",
        });
      }
    },
  },
};
</script>

<style>
#arch-error div div:nth-child(1) {
  width: 100% !important;
}
#nprogress .bar {
  background: #ec1721 !important;
}
#nprogress .spinner-icon {
  width: 18px;
  height: 18px;
  box-sizing: border-box;
  border: solid 2px transparent;
  border-top-color: #ec1721 !important;
  border-left-color: #ec1721 !important;
}
#nprogress .spinner {
  top: 2px;
  right: 2px;
}
</style>