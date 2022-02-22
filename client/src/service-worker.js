self.addEventListener('message', (e) => {
  if (!e.data) {
    return;
  }
  switch (e.data) {
    case 'skipWaiting':
      self.skipWaiting();
      console.log("Updating app...")
      break;
    default:
      break;
  }
});

self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerNavigationRoute(workbox.precaching.getCacheKeyForURL("index.html"));
