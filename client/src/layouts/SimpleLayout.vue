<template>
  <div>
    <slot></slot>
  </div>
</template>


<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class SimpleLayout extends Vue {
}
</script>

<style>
.v-application--wrap {
  background-color: #fff;
}
</style>
