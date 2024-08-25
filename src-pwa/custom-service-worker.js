/* eslint-env serviceworker */

/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config.js > pwa > workboxMode is set to "injectManifest"
 */

import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'

self.skipWaiting()
clientsClaim()

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST)

cleanupOutdatedCaches()

// Non-SSR fallback to index.html
// Production SSR fallback to offline.html (except for dev)
// if (process.env.MODE !== 'ssr' || process.env.PROD) {
//   registerRoute(new NavigationRoute(createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML), { denylist: [/sw\.js$/, /workbox-(.)*\.js$/] }))
// }

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('https://lh3.googleusercontent.com')) {
    return
  }
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        return fetch(event.request)
          .then((networkResponse) => {
            return caches.open('images-cache').then((cache) => {
              cache.put(event.request, networkResponse.clone())
              return networkResponse
            })
          })
          .catch((error) => {
            console.error(error)
            return caches.match('/path/to/fallback-image.jpg')
          })
      })
    )
  }
})
