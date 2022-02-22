import Vue from 'vue'
import store from '../store'
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"
import LocalizedFormat from "dayjs/plugin/localizedFormat"
import customParseFormat from "dayjs/plugin/customParseFormat"
import duration from "dayjs/plugin/duration"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(utc)
dayjs.extend(LocalizedFormat)
dayjs.extend(customParseFormat)
dayjs.extend(duration)
dayjs.extend(relativeTime)
Vue.filter('formatDate', (value:any, filterFormat?:string, forceFormat?:boolean) => {
  // @ts-ignore
  const { zone, format } = store.state.app.time
  if (value) {
    let date = dayjs(value);
    let now = dayjs(new Date());
    let hours = now.diff(date,"hour")
    if(hours <= 6 && forceFormat!==true){
      return date.fromNow()
    };
    return date.format(filterFormat || format || 'YYYY-MM-DD HH:mm:ss')
  }

  return ''
})
