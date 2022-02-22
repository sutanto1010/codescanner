import { VueConstructor } from 'vue';
import axios, { AxiosRequestConfig, CancelToken } from 'axios'
// @ts-ignore
import config from './Api-config'
// @ts-ignore
import NProgress from 'nprogress'
// @ts-ignore
import hasha from 'hasha'
// @ts-ignore
import storage from '../storage/storage'
import isReachable from 'is-reachable'
import app from "@/store/app"
import qs from 'query-string'
declare module 'vue/types/vue' {
  interface Vue {
    $http: {
      get: (url: string, params?:any, headers?:any, runtimeSize?:ApiRuntimeSize,skipCancellation?:boolean) => Promise<any>,
      post: (url: string, data?:any, headers?:any, runtimeSize?:ApiRuntimeSize, ignoreGlobalErrorHandler?:boolean) => Promise<any>,
      del: (url: string, data?:any, headers?:any, runtimeSize?:ApiRuntimeSize) => Promise<any>,
      put: (url: string, data?:any, headers?:any, runtimeSize?:ApiRuntimeSize) => Promise<any>,
      isOnline: () => Promise<boolean>
    };
  }
}

async function stringHash(value:string) {
  return hasha.async(value, {algorithm:"sha1"});
}

const instance = axios.create({
  baseURL: config.BASE_API_URL,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
  },
  // @ts-ignore
  useGlobalErrorHandler: true
});

// before a request is made start the nprogress
instance.interceptors.request.use(async (c) => {
  NProgress.start();
  let url = c.url;
  let query = qs.parse(location.search) as any;
  url=url?.replaceAll("{oui}", query.oui);
  c.url=url
  c.headers.token = await storage.getItem(config.STORAGE_KEYS.TOKEN);
  c.params = {
    ...c.params,
    origin: location.origin,
  }
  delete c.headers["key"];
  return c;
});

// before a response is returned stop nprogress
instance.interceptors.response.use(async (response) => {
  NProgress.done();
  let config = response.config;
  let maxAge = config.headers['max-age']
  let key = config.headers['key']

  if(maxAge > 0) {
    let data=""
    if(config.data){
      data=config.data
    }
    let rawKey = `${config.url}${config.method}${data}`
    let hashKey = await stringHash(rawKey)
    await storage.setItem(hashKey, response.data)
  }
  if(key!="" && key!=null) {
    await storage.setItem(key, response.data)
  }
  return response;
}, async (error) => {
  NProgress.done();
  console.log({ error });
  if(error.response && error.config.useGlobalErrorHandler){
    let message=error.response.data
    app.state.info.textColor="#E81123"
    app.state.info.icon="fas fa-exclamation-circle"
    if(
      error.response.status==500 ||
      error.response.status==400){
      message=message.Message
    }
    app.state.info.body= message;
    app.state.info.visible=true
  }

  return await Promise.reject(error);
});

export class ApiRuntimeSize {
  static Small:string="sm"
  static Medium:string="md"
  static Large:string="lg"
}

export let Api = {
  cancelTokens:{},
  async isOnline() :Promise<boolean>{
    return await isReachable(config.IS_ONLINE_URL!);
  },
  async post(url:string, data?:any, header?:any, runtimeSize?:ApiRuntimeSize, ignoreGlobalErrorHandler?: boolean):Promise<any>{
    let online = await this.isOnline()
    if(!online){
      let cacheKey="pending_POST"
      let cacheData = {
        Status: false,
        Message: "Offline"
      }
      let item = {
        url,
        data,
        timestamp:Math.floor(Date.now() / 1000),
        retryCount: 0,
        success: false,
        message:""
      }

      let items:any = await storage.getItem(cacheKey) || []
      items.push(item)
      await storage.setItem(cacheKey, items)
      return Promise.resolve({
          data: cacheData
        }
      )
    }
    const headers = {
      'max-age': header?.maxAgeInSecond || 0,
      'Content-Type': header?.contentType || 'application/json',
    };
     // @ts-ignore
    return instance({
      url,
      method: 'POST',
      headers,
      data,
      useGlobalErrorHandler: !ignoreGlobalErrorHandler
    });
  },
  async del(url:string, data?:any, header?:any,runtimeSize?:ApiRuntimeSize):Promise<any>{
    let online = await this.isOnline()
    if((header?.maxAgeInSecond || 3600) > 0 && !online){
      let rawKey=`${url}del${JSON.stringify(data)}`
      let hashKey = await stringHash(rawKey)
      let cacheData = await storage.getItem(hashKey)
      return Promise.resolve({
          data: cacheData
        }
      )
    }
    const headers = {
      'max-age': header?.maxAgeInSecond || 0,
      'Content-Type': header?.contentType || 'application/json',
    };
    return instance({
      url,
      method: 'DELETE',
      headers,
      data,
    });
  },
  async put(url:string, data?:any, maxAgeInSecond=0,runtimeSize?:ApiRuntimeSize):Promise<any>{
    let online = await this.isOnline()
    if(!online){
      let cacheKey="pending_PUT"
      let cacheData = {
        Status: false,
        Message: "Offline",
      }

      let item = {
        url,
        data,
        timestamp:Math.floor(Date.now() / 1000),
        retryCount: 0,
        success: false,
        message:""
      }

      let items:any = await storage.getItem(cacheKey) || []
      items.push(item)
      await storage.setItem(cacheKey, items)
      return Promise.resolve({
          data: cacheData
        }
      )
    }
    let headers={
      "max-age": maxAgeInSecond
    }
    let config={
      headers
    }
    return instance.put(url, data, config);
  },
  async get(
    url:string,
    params?:any,
    header?:any,
    runtimeSize?:ApiRuntimeSize,
    skipCancellation?:boolean,
    ignoreGlobalErrorHandler?: boolean):Promise<any>{
    let online = await this.isOnline()
    if(!online){
      let rawKey=`${url}get`
      let hashKey = await stringHash(rawKey)
      let cacheData = await storage.getItem(hashKey)
      return Promise.resolve({
          data: cacheData,
        }
      );
    }
    let basePath= url.split("?")[0]
    const headers = {
      'max-age': header?.maxAgeInSecond || 3600,
      'Content-Type': header?.contentType || 'application/json',
    };
    let config: AxiosRequestConfig & { useGlobalErrorHandler?: boolean } = {
      url,
      method: 'GET',
      params,
      headers
    }
    if(skipCancellation!==true){
      let newCancelToken=axios.CancelToken.source()
      let prevCancelToken = this.cancelTokens[basePath]
      if(prevCancelToken){
        prevCancelToken.cancel()
      }
      config.cancelToken=newCancelToken.token
      config.useGlobalErrorHandler = !ignoreGlobalErrorHandler
      this.cancelTokens[basePath]=newCancelToken
    }
    return instance(config);
  }
};
export default function AxiosPlugin(Vue: VueConstructor): void {
  Vue.prototype.$http = Api
}
