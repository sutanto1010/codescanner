///ts-nocheck
import config from './Api-config'
import storage from '@/storage/storage'
const MessageType = {
    Normal:1,
    JoinGroup : 2,
    RegisterEvent : 3,
    WARequestQRCode : 101,
}
class SignalGo {
    conn:WebSocket
    id=null
    connected=false
    options={
        url:config.WS_URL,
        autoRetry:false,
        //autoRetryInMs:1000*60*10,
        autoRetryInMs:1000,
    }
    events={}
    OnClose:any=null
    OnError:any=null
    OnConnected:any=null
    log={
        i(msg){
            console.log("SignalGo:");            
            console.info(msg)
        },
        e(msg){
            console.log("SignalGo:");
            console.error(msg)
        },
        d(msg){
            console.log("SignalGo:");
            console.debug(msg)
        }
    }
    async Connect(opts){
        let options=this.options
        this.options={
            ...options,
            ...opts
        }
        await this.doConnect()
    }
    async reConnect(){
        if(this.options.autoRetry){
            setTimeout(async ()=>{
                if(this.conn.readyState==WebSocket.CLOSED) {
                    await this.doConnect()
                }
            }, this.options.autoRetryInMs)
        }
    }

    Disconnect(){
        if(this.connected){
            this.conn.close()
        }
    }
    async doConnect(){
        if(!this.connected){
            let tokenParam=""
            let token = await  storage.getItem(config.STORAGE_KEYS.TOKEN)
            if(token){
                tokenParam=`?token=${token}`
            }

            if(this.conn){
                this.conn.onclose=null
                this.conn.onerror=null
                this.conn.onopen=null
                this.conn.onmessage=null
            }
            let conn=new WebSocket(`wss://${this.options.url+tokenParam}`)
            conn.onclose=async (ev) => {
                this.log.e("On Close: " + ev)
                this.connected = false
                if (this.OnClose) {
                    this.OnClose(ev)
                }
                await this.reConnect()
            }

            conn.onmessage=(ev) => {
                    let payload = JSON.parse(ev.data)
                    if(payload.e){
                        let callBack = this.events[payload.e]
                        if(callBack){
                            let content = payload.content
                            if(!content || content==""){
                                content="{}"
                            }
                            callBack(JSON.parse(content))
                        }
                    }
                    this.log.i(ev)
            }
            conn.onerror=(ev)=>{
                this.log.e("On Error: " + ev)
                this.connected = false
                if (this.OnError) {
                    this.OnError(ev)
                }
               
                this.reConnect()
            }
            conn.onopen= (ev) => {
                this.log.i("Connected: " + ev)
                this.connected = true
                if (this.OnConnected) {
                    this.OnConnected(ev)
                }
                Object.keys(this.events).forEach(key => {
                    this.registerEvent(key);
                })
            }
            this.conn=conn
        }
    }

    registerEvent(key) {
        let payload = {
            "t": MessageType.RegisterEvent,
            "e": key
        }
        this.doSend(payload, "Error on event registration!")
    }
    Unsubscribe(ev){
        delete this.events[ev]
        //TODO: unsubscribe to server
    }
    Subscribe(ev,callback){
        this.On(ev,callback)
    }
    On(ev, callBack){
        this.events[ev]=callBack
        if(this.connected){
            this.registerEvent(ev)
        }
    }
    JoinGroup(group){
        let payload = {
            "t": MessageType.JoinGroup,
            "g":group
        }
        this.doSend(payload,"Can't join to any group if connection is not established yet!")
    }
    doSend(payload,err,force?){
        if(!this.connected && !force){
            console.error(err)
            return
        }
        //let buff=this.str2ab(JSON.stringify(payload))
        this.conn.send(JSON.stringify(payload))
    }
    Send(ev,message){
        let payload = {
            "t":MessageType.Normal,
            "m":message,
            "e":ev
        }
        this.doSend(payload,"Can't send message if connection is not established yet!")
    }
    
}
let signalGo = new SignalGo()
export  {signalGo, MessageType}