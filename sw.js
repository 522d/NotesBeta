importScripts('./node_modules/workbox-sw/build/workbox-sw.js');

// if (workbox) {
//   console.log(`Yay! Workbox is loaded 🎉`);
// } else {
//   console.log(`Boo! Workbox didn't load 😬`);
// }
// const staticAssets = ;
new workbox.broadcastUpdate.Plugin(
  'cache-updates',
  {headersToCheck: ['etag']}
);



 workbox.routing.registerRoute('/..',workbox.strategies.networkFirst());
 workbox.routing.registerRoute('./app.js',workbox.strategies.networkFirst());

  // cache images
  
workbox.routing.registerRoute(new RegExp('http://localhost:62077/api/(.*)'),workbox.strategies.networkFirst());
workbox.routing.registerRoute(new RegExp('/(.*)'),workbox.strategies.networkFirst());

workbox.routing.registerRoute(
    // Cache image files
    /.*\.(?:png|jpg|jpeg|svg|gif)/,
    // Use the cache if it's available
    workbox.strategies.cacheFirst({
      // Use a custom cache name
      cacheName: 'news-images',
      plugins: [
        new workbox.cacheableResponse.Plugin({
          // Cache only 20 images
          maxEntries: 20,
          // Cache for a maximum of a week
          maxAgeSeconds: 7 * 24 * 60 * 60,
          statuses:[0,200]
          
        })
      ],
    })
);
  

self.addEventListener('fetch', (event) => {

    if (event.request.url === '/') {

      const staleWhileRevalidate = new workbox.strategies.StaleWhileRevalidate({
          plugins: [
        new workbox.broadcastUpdate.Plugin('api-update')]
      });
      event.respondWith(staleWhileRevalidate.handle({event}));
    }
  });


  function handleApiRequest(event)
  {
      const networkFetch = fetch(event.request)

      event.waitUntil(
        networkFetch.then(response =>{
          const responseClone = reponse.clone();
          caches.open('requests')
            .then(cache => cache.put(event.request,responseClone()))
        })
      );

      return caches.match(event.request).then(response => response || networkFetch)

  }
//workbox.precaching.precacheAndRoute(staticAssets);


// workbox.prechaching.prechacheAndRoute(staticAssets);
//workbox.prechaching.prechacheAndRoute(staticAssets);


// self.addEventListener('install', async event=>{
//     console.log('install');

//     const cache = await caches.open('news-static');
//     cache.addAll(staticAssets);
// });

// self.addEventListener('fetch', event =>{
//     console.log('fetch');

//     const req = event.request;
    
//     console.log(req);
//     const url = new URL(req.url);
//     if(url.origin == location.origin){
//         event.respondWith(cacheFirst(req));
//     }
//     else
//     {
//         event.respondWith(networkFirst(req));
//     }
// })

// async function cacheFirst(req) {
//     const cachedResponse = await caches.match(req);

//     return cachedResponse || fetch(req);
// }


// async function networkFirst(req){
//     const cache = await caches.open('news-dynamic');

//     try {

//         //return all cached
//         const res = await fetch(req);
//         cache.put(req,res.clone());
//         return res;
//     } catch (error) {
//         const cachedResponse = await cache.match(req);
//         return cachedResponse ||  caches.match('./fallback.json');
        
//         // return await cache.match(req);
//     }
// }