<template>
  <v-snackbar
    v-model="visible"
    top
    centered
    :color="color"
    elevation="24"
  >
    <div v-html="message" v-if="useHTML"></div>
    <span v-else>
      {{ message }}
    </span>
    <template v-slot:action="{ attrs }">
      <v-btn
        v-if="showClose"
        :color="buttonColor"
        text
        v-bind="attrs"
        @click="visible = false"
      >
        {{ confirmButtonText }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class ArchNotify extends Vue {
  @Prop({ type: String }) message: string;
  @Prop({ type: String }) color: string;
  @Prop({ type: String }) buttonColor: string;
  @Prop({ type: [Number, String] }) width: number | string;
  @Prop({ type: Boolean }) showClose: boolean;
  @Prop({ type: Boolean, default: false }) useHTML: boolean;
  @Prop( { type: String, default: 'Close' }) confirmButtonText: string;

  visible:boolean = true;
}
</script>
