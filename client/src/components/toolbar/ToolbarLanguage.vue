<template>
  <v-menu
    offset-y
    left
    transition="slide-y-transition"
  >
    <template v-slot:activator="{ on }">
      <v-btn text :icon="$vuetify.breakpoint.smAndDown" v-on="on">

        <span v-show="$vuetify.breakpoint.mdAndUp && showLabel" :class="[$vuetify.rtl ? 'mr-1' : 'ml-1']">{{ currentLocale.label }}</span>
        <v-icon v-if="showArrow" right>mdi-chevron-down</v-icon>
      </v-btn>
    </template>

    <v-list dense nav>
      <v-list-item v-for="locale in availableLocales" :key="locale.code" @click="setLocale(locale.code)">
        <v-list-item-title>{{ locale.label }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>

export default {
  components: {

  },
  props: {
    showArrow: {
      type: Boolean,
      default: false
    },
    showLabel: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    currentLocale() {
      let temp = this.$i18n.locales.find((i) => i.code === this.$i18n.locale)
      this.$store.state.app.local=temp
      return temp
    },
    availableLocales () {
      return this.$i18n.locales.filter((i) => i.code !== this.$i18n.locale)
    }
  },
  methods: {
    setLocale(locale) {
      this.$i18n.locale = locale
      this.$vuetify.lang.current = locale
      if (locale === 'ar') {
        this.$vuetify.rtl = true
      } else {
        this.$vuetify.rtl = false
      }
    }
  }
}
</script>
