import storage from "../storage/storage";
import { Api } from "@/services/Api";
import store from "@/store";

export class PendingRequestWorker implements IWorker {
  Name: string = "PendingRequestWorker";
  Priority: number = 1;

  async SyncData(key: string, method: string) {
    const pendingRequests: any[] = (await storage.getItem(key)) || [];
    const failedRequests: any[] = [];

    for (let i = 0; i < pendingRequests.length; i++) {
      const pendingRequest: any = pendingRequests[i];
      const { data, url } = pendingRequest;
      try {
        await Api[method](url, data);
      } catch (e) {
        // TODO Change message on failedRequest
        failedRequests.push(pendingRequest);
      }
    }

    await storage.setItem(key, failedRequests);
  }

  static async SyncByUrl(targetUrl: string) {
    await store.dispatch("app/setSyncing", true);
    const toSync = [];
    const failedRequests:any = {
      post: [],
      put: [],
    };

    const tryRequest = async (requests: any, method: string) => {
      for (let i = 0; i < toSync.length; i++) {
        const pendingRequest: any = toSync[i];
        const { data, url } = pendingRequest;
        try {
          await Api[method](url, data);
        } catch (e) {
          if (method === "post") {
            failedRequests.post.push(pendingRequest);
          } else if (method === "put") {
            failedRequests.put.push(pendingRequest);
          }
        }
      }
    };

    const pendingPosts = (await storage.getItem<any>("pending_POST")).filter(
      (request) => request.url === targetUrl
    );
    const pendingPuts = (await storage.getItem<any>("pending_PUT")).filter(
      (request) => request.url === targetUrl
    );
    await tryRequest(pendingPosts, "post");
    await storage.setItem("pending_POST", failedRequests.post);
    await tryRequest(pendingPuts, "put");
    await storage.setItem("pending_PUT", failedRequests.put);
    await store.dispatch("app/setSyncing", false);
  }

  async Do(): Promise<void> {
    await store.dispatch("app/setSyncing", true);
    await this.SyncData("pending_POST", "post");
    await this.SyncData("pending_PUT", "put");
    await store.dispatch("app/setSyncing", false);
    window.location.reload();
  }
}
