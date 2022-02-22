<template>
  <v-menu
    v-model="showCalendar"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    max-width="290px"
    min-width="290px">
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        v-model="dateFormatted"
        :label="label"
        :hint="hint"
        v-bind="$attrs"
        v-on="$listeners"
        autocomplete="off"
        persistent-hint
        v-on:focusin="()=>{
          fromKeyboard=true
        }"
        v-on:focusout="()=>{
          fromKeyboard=false
          onValueChanged(value)
        }"
        v-on:change="onDateFormattedChanged"
        @click="toggleCalendar"
        :dense="dense"
        :readonly="readonly"
        :prepend-icon="prependIcon"></v-text-field>
    </template>
    <v-date-picker v-model="internalValue"
                   ref="vuetifyDatePicker"
                   no-title
                   :scrollable="true"
                   v-bind="$attrs"
                   v-on="$listeners"
                   :show-adjacent-months="true"
                   :min="minInternal"
                   :max="maxInternal"
                   v-on:change="()=>{
                     showCalendar=false
                   }"
                   @input="showCalendar = true">
      <slot></slot>
    </v-date-picker>
  </v-menu>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import dayjs from "dayjs";

@Component
export default class ArchDatePickerV2 extends Vue {
  internalValue:any=null
  showCalendar:boolean=false
  dateFormatted:any=""
  fromKeyboard:boolean=false
  @Prop()
  value:Date
  @Prop()
  label
  @Prop()
  hint
  @Prop()
  prependIcon
  @Prop()
  format
  @Prop()
  min: string
  @Prop()
  max: string
  @Prop()
  dense: boolean;
  @Prop({ type: Boolean, default: false }) readonly: boolean;

  $refs:any
  created(){
    let theDate=dayjs.utc(Date.now())
    this.$emit("input", theDate.toDate())
  }
  get minInternal(){
    return this.min ? dayjs(this.min).toISOString() : null;
  }
  get maxInternal(){
    return this.max ? dayjs(this.max).toISOString() : null;
  }
  @Watch("internalValue")
  onInternalValueChanged(newValue) {
    let theDate=dayjs.utc(newValue)
    this.$emit("input", theDate.toDate())
    this.dateFormatted=theDate.format("YYYY-MM-DD")
  }

  onDateFormattedChanged(val){
    let theDate=dayjs.utc(val)
    if(theDate.isValid()){
      this.internalValue=theDate.format("YYYY-MM-DD")
      this.$emit("input", theDate.toDate())
    }
  }

  public toggleCalendar() {
    if (!this.readonly) {
      this.showCalendar = true;
    }
  }

  @Watch("value")
  onValueChanged(newVal){
    if(this.fromKeyboard)
      return

    let theDate=dayjs.utc(newVal)
    if(theDate.isValid()) {
      this.internalValue=theDate.format("YYYY-MM-DD")
      //this.dateFormatted = theDate.format("YYYY-MM-DD")
    }
  }

  mounted() {
    if(this.value) {
      this.internalValue = dayjs(this.value).format("YYYY-MM-DD")
    }
  }

}
</script>

<style scoped>

</style>
