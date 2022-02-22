class MemoryCache {
  items:any[string][any]=[]
  Get<T>(key:string):T{
    var anyValue = this.items[key]

    return anyValue
  }
  Set(key:string, value:any){
    this.items[key]=value
  }
  Del(key:string){
    delete this.items[key]
  }
}

let instance= new MemoryCache()
export default instance
