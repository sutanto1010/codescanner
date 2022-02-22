<template>
  <v-dialog
    :width="width"
    v-model="visible"
    :persistent="persistent"
  >
    <v-card>
      <v-card-title class="headline">
        {{ title }}
      </v-card-title>

      <v-card-text>
        {{ message }}
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          :color="cancelButtonColor"
          @click="cancel"
        >
          {{ cancelButtonText }}
        </v-btn>
        <v-btn
          color="primary"
          @click="confirm"
        >
          {{ confirmButtonText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class ArchAlertDialog extends Vue {
  @Prop({ type: String, default: '' }) title?: string;
  @Prop({ type: String, default: '' }) message?: string;
  @Prop({ type: String, default: 'warn' }) type?: string;
  @Prop({ type: Boolean, default: false }) persistent?: boolean;
  @Prop({ type: String, default: 'Ok' }) confirmButtonText?: string;
  @Prop({ type: String, default: 'primary' }) confirmButtonColor?: string;
  @Prop({ type: String, default: 'error' }) cancelButtonColor?: string;
  @Prop({ type: String, default: 'Cancel' }) cancelButtonText?: string;
  @Prop({ type: [String, Number], default: 300 }) width?: string | number;

  public visible: boolean = true;

  public confirm():void {
    this.visible = false;
    this.$emit('confirm');
  }

  public cancel(): void {
    this.visible = false;
    this.$emit('cancel');
  }
};
</script>
