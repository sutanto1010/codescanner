// Options with default values
import localForage from 'localforage'
localForage.config({
  //driver      : localforage.WEBSQL, // Force WebSQL; same as using setDriver()
  name        : 'BraderPush',
  version     : 1.0,
  size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
  storeName   : 'BraderPush_Storage', // Should be alphanumeric, with underscores.
  description : 'BraderPush Local Storage'
})
export default localForage
