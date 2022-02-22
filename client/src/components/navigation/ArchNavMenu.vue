<template>
  <v-list dense style="padding: 2px 0 2px 0;" :style="getContainerStyle()">
    <v-list-group
      v-if="item.items && !item.ignoreItems"
      :key="item.text"
      v-model="item.expanded"
      :prepend-icon="getPrependIcon(item)"
      :append-icon="getAppendIcon(item)"
    >
      <template v-slot:activator>
        <v-list-item-content>
          <v-list-item-title>
            {{ item.text }}
          </v-list-item-title>
        </v-list-item-content>
      </template>
      <ArchNavMenu
        :item="child"
        v-for="(child, i) in item.items"
        :key="`menu-${i}`"
      />
    </v-list-group>
    
    <v-list-item
      v-else
      :key="item.text"
      link
      :title="item.text"
      :to="item.link"
    >
      <v-list-item-action>
        <v-icon>{{ item.icon }}</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>
          {{ item.text }}
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    
  </v-list>
</template>

<script>
export default {
  name: "ArchNavMenu",
  props: {
    item: {},
  },
  methods: {
    getContainerStyle(i) {
      let level = this.item.level || 1
      // if(level>1){
      //   return {}
      // }
      return {
        //marginLeft: ((level-1) * 15)+"px",
        //marginLeft:"5px",
        //marginRight: "5px"
      };
    },
    getPrependIcon(item) {
      return item.expanded ? "mdi-chevron-up" : "mdi-chevron-down";
      if (item.level == 1) {
        return item.expanded ? "mdi-chevron-up" : "mdi-chevron-down";
      }
      return "";
    },
    getAppendIcon(item) {
      return "";
      if (item.level == 2) {
        return item.expanded ? "mdi-minus" : "mdi-plus";
      }
      return "";
    },
  },
};
</script>

<style>
.arch-menu a.v-list-item--active,
.arch-menu a.v-list-item--active .v-icon{
    /* color: red !important; */
    /* color: var(--v-primary-lighten1) !important; */
    
}
.arch-menu a.v-list-item--active{
    /* background-color: var(--v-primary-lighten1) !important; */
    background-color: #E8F0FE !important;
    color: var(--v-primary-base) !important;
}
.arch-menu a.v-list-item:hover{
  background-color: #F6F6F6 ;
}
.arch-menu a.v-list-item{
  border-top-right-radius: 25px;
  border-bottom-right-radius: 25px;
}
.arch-menu .v-list{
  background: white;
}
.arch-menu .v-list-item--link:before{
  background-color: white !important;
}
.arch-menu .theme--light.v-list-item:hover::before{
  opacity: 0 !important;
}
</style>
