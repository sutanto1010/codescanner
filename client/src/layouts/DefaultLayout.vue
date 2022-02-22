<template>
  <div class="d-flex flex-grow-1">
    <v-navigation-drawer
      :class="{ offline: state.isOffline }"
      :mini-variant="state.drawerMiniVariant"
      v-model="state.showDrawer"
      :app="true"
      :floating="true"
      :clipped="true"
      permanent
      :right="$vuetify.rtl"
      :light="state.menuTheme === 'light'"
      :dark="state.menuTheme === 'dark'"
    >
      <div class="arch-menu">
        <ArchNavMenu
          :key="i"
          :item="item"
          v-for="(item, i) in navigation.menu"
        />
        <v-divider style="margin: 10px 0"></v-divider>
        <ArchNavMenu
          :key="item.link"
          :item="item"
          v-for="item in menus"
        />
      </div>
    </v-navigation-drawer>
    <v-app-bar
      :class="{ offline: state.isOffline }"
      :app="true"
      :clipped-left="true"
      :color="state.isToolbarDetached ? 'surface' : undefined"
      :flat="state.isToolbarDetached"
      :light="state.toolbarTheme === 'light'"
      :dark="state.toolbarTheme === 'dark'"
    >
      <v-card
        class="flex-grow-1 d-flex"
        :class="[state.isToolbarDetached ? 'pa-1 mt-3 mx-1' : 'pa-0 ma-0']"
        :flat="!state.isToolbarDetached"
      >
        <div class="d-flex flex-grow-1 align-center">
          <div class="d-flex flex-grow-1 align-center">
            <v-app-bar-nav-icon
              @click.stop="onDrawerIconClicked()"
            ></v-app-bar-nav-icon>
            <div class="pa-2">
              <div class="title font-weight-bold primary--text">
                ⚡ {{ state.product.name }}
                <span class="overline grey--text text-lowercase"
                  >v{{ state.product.version }}</span
                >
              </div>
            </div>
            <v-spacer class="d-none d-lg-block"></v-spacer>
            <v-spacer class="d-block d-sm-none"></v-spacer>
            <v-btn class="d-block d-sm-none" icon @click="showSearch = true">
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
            <div :class="[$vuetify.rtl ? 'ml-1' : 'mr-1']">
              <toolbar-notifications />
            </div>
            <toolbar-user />
          </div>
        </div>
      </v-card>
    </v-app-bar>
    <v-main>
      <v-container class="fill-height" :fluid="!state.isContentBoxed" style="padding: 10px 5px 0 5px; background: white;">
        <v-layout>
          <slot></slot>
        </v-layout>
      </v-container>
    </v-main>
  </div>
</template>

<script lang="ts">
import config from "../configs";
import MainMenu from "../components/navigation/MainMenu.vue";
import ToolbarUser from "../components/toolbar/ToolbarUser.vue";
import ToolbarLanguage from "../components/toolbar/ToolbarLanguage.vue";
import ToolbarNotifications from "../components/toolbar/ToolbarNotifications.vue";
import ArchNavMenu from "@/components/navigation/ArchNavMenu.vue";
import navigation from "@/configs/navigation";
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {
    MainMenu,
    ToolbarUser,
    ToolbarLanguage,
    ToolbarNotifications,
    ArchNavMenu,
  },
})
export default class DefaultLayout extends Vue {
  drawer: any = null;
  showSearch: any = false;
  searchKeyword: any = "";
  searchResultVisible: any = false;
  searchResultItems: any = [];
  navigation: any = config.navigation;
  get state() {
    return this.$store.state.app;
  }
  menus:any[]=[
    {
      text: "Rules",
      icon: "mdi-format-list-bulleted-square",
      link: "/rules",
      icon_color:"primary"
    } 
  ]
  $refs: any;
  onKeyup(e) {
    this.$refs.search.focus();
  }
  onDrawerIconClicked() {    
    if(!this.state.showDrawer){
      this.state.showDrawer = true;
    }else{
      this.state.drawerMiniVariant = !this.state.drawerMiniVariant;
    }
  }
  showSearchResult(ev) {
    if (this.searchKeyword && this.searchKeyword.length > 0) {
      let keyword = this.searchKeyword.toLowerCase();
      this.searchResultItems = [];
      this.initSearchResultItems(
        {
          items: navigation.menu,
        },
        {},
        keyword
      );
      this.searchResultVisible = true;
    } else {
      this.searchResultVisible = false;
    }
  }
  initSearchResultItems(item, parent, keyword) {
    let self = this;
    if (item.items != null) {
      item.items.forEach((i) => {
        let theItem = item;
        theItem.parentText = parent.text;
        self.initSearchResultItems(i, theItem, keyword);
      });
    } else {
      let textToSearch =
        (item.text || "") +
        (item.keywords || "") +
        (parent.text || "") +
        (parent.keywords || "");
      if (textToSearch.toLowerCase().indexOf(keyword) != -1) {
        let parentText = parent.text;
        if (parent.parentText && parent.parentText.length > 0) {
          parentText =
            parent.parentText +
            " <span style='color: black !important;'>&rarr;</span> " +
            parentText;
        }
        this.searchResultItems.push({
          parentText,
          items: [item],
        });
      }
    }
  }
  getSearchResultItems() {
    let parents: any[] = [];
    let items: any[] = [];
    this.searchResultItems.forEach((i) => {
      let item: any = {
        ...i,
      };
      if (parents.indexOf(i.parentText) != -1) {
        item.parentText = null;
      } else {
        parents.push(i.parentText);
      }
      items.push(item);
    });
    return items;
  }
}
</script>
<style>
.offline {
  top: 25px !important;
}
.v-navigation-drawer .fa:before,
.v-navigation-drawer .fas:before {
  font-size: 18px !important;
}
</style>