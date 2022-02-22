<template>
  <v-dialog
    ref="dialog"
    v-model="showModal"
    :return-value.sync="time"
    persistent
    width="290px">
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        :value="time"
        :label="label"
        :prepend-icon="icon"
        readonly
        v-bind="attrs"
        :dense=dense
        v-on="on">
      </v-text-field>
    </template>
    <v-time-picker
      v-if="showModal"
      v-model="time"
      full-width>
      <v-spacer></v-spacer>
      <v-btn
        text
        color="primary"
        @click="showModal = false">
        Cancel
      </v-btn>
      <v-btn
        text
        color="primary"
        @click="$refs.dialog.save(time)">
        OK
      </v-btn>
    </v-time-picker>
  </v-dialog>
</template>

<script lang="ts">
import {Component, Emit, Prop, Vue, Watch} from 'vue-property-decorator'

@Component
export default class ArchTimePicker extends Vue {
  @Prop()
  icon:string
  @Prop()
  dense:boolean
  @Prop()
  label:string
  showModal:boolean=false
  time:any=null
  @Prop()
  onChange:any
  @Prop()
  value:any
  @Watch("value")
  onValueChanged(newValue){
    this.time=newValue
  }
  @Watch("time")
  onTimeChanged(newValue){
    this.$emit("input", newValue)
    if(this.onChange){
      this.onChange(newValue)
    }
  }
  created(){
    this.time=this.value
  }
}
</script>

<style scoped>

</style>
