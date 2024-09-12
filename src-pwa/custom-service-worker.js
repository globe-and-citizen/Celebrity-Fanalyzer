/* eslint-env serviceworker */

/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config.js > pwa > workboxMode is set to "injectManifest"
 */

import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

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

const CACHE_NAME = 'images-cache'
const TTL = 10 * 24 * 60 * 60 * 1000

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (url.origin === 'https://lh3.googleusercontent.com') {
    return
  }
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then(async (cachedResponse) => {
        if (cachedResponse) {
          const cachedTime = await caches.match(event.request.url + '-time')
          const cachedDate = cachedTime ? await cachedTime.json() : 0
          const isExpired = Date.now() - cachedDate > TTL

          if (!isExpired) {
            return cachedResponse
          }
          caches.delete(event.request)
          caches.delete(event.request.url + '-time')
        }

        return fetch(event.request)
          .then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone())
              cache.put(event.request.url + '-time', new Response(JSON.stringify(Date.now())))
              return networkResponse
            })
          })
          .catch((error) => {
            console.error('Image not found', error)
          })
      })
    )
  }
})

registerRoute(
  ({ url }) => url.host.startsWith('fonts.g'),
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
)
registerRoute(({ url }) => url.href.startsWith('http'), new StaleWhileRevalidate())
