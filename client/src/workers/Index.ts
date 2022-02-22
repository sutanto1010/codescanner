import {HelloWorker} from "./HelloWorker"
import {PendingRequestWorker} from "./PendingRequestWorker"
let workers=[
  new HelloWorker(),
  new PendingRequestWorker()
]

export default {
  Run(){
    workers.sort(i => i.Priority).forEach(w => {
      w.Do()
    })
  }
}
