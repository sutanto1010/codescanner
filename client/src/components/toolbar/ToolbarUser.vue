<template>
  <v-menu offset-y left transition="slide-y-transition">
    <template v-slot:activator="{ on }">
      <v-btn icon class="elevation-2" v-on="on">
        <v-avatar size="40">
          <v-img :src="UserPicture"></v-img>
        </v-avatar>
      </v-btn>
    </template>

    <v-card width="350" style="padding: 20px; border: solid 1px #d6d0d0;">
      <div style="width: 100%; text-align: center;">
        <div style="margin: 0 auto; width: 150px; height: 150px; background: gray; border-radius: 50%;"
             v-bind:style="{'background-image': 'url('+UserPicture+')', 'background-size':'cover'}"
             ></div>
        <div style="font-size: large; font-weight: bold; margin-top: 5px;">{{user.name}}</div>
        <div style="font-size: small;">{{user.email}}</div>
      </div>

      <v-divider class="my-1"></v-divider>
      <v-list-item
        v-for="(item, index) in menu"
        :key="index"
        :to="item.link"
        :exact="item.exact"
        :disabled="item.disabled"
        link
      >
        <v-list-item-icon>
          <v-icon small :class="{ 'grey--text': item.disabled }">{{ item.icon }}</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ item.key ? $t(item.key) : item.text }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-divider class="my-1" v-if="menu.length>0"></v-divider>
      <v-list-item @click="SignOut()">
        <v-list-item-icon>
          <v-icon small>mdi-logout-variant</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ $t('menu.logout') }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-card>
  </v-menu>
</template>

<script>
import config from '../../configs';
import router from '@/router';
import {mapActions, mapState} from "vuex";
import defaultPicture from "../../assets/account.png"

export default {
  data() {
    return {
      menu: config.toolbar.user
    }
  },
  computed:{
    ...mapState("app",["user"]),
    UserPicture(){
      let url=this.user.image_url
      if(url==null || url==""){
        url=defaultPicture
      }
      return url
    }
  },
  async mounted() {
  },
  methods:{
    ...mapActions("app"),
    SignOut() {
      this.$confirm(
        'Are you sure?',
        'Sign Out',
        "",
        ()=>{
        }
      )
    }
  }
}
</script>
