import { defineStore } from 'pinia';

const checkCompatibility = () => {
  if (!('caches' in self)) {
    throw new Error('CacheStorage is not supported in this browser');
  }
}

export const useCacheStore = defineStore('cache', {
  state: () => ({
    _isLoading: false
  }),

  getters: {
    isLoading: (state) => state._isLoading
  },

  actions: {
    async request(url, cacheName) {
      checkCompatibility();
      this._isLoading = true;

      const cache = await caches.open(cacheName);
      const cachedResponse = await cache.match(url);

      if (cachedResponse) {
        this._isLoading = false;
        return cachedResponse;
      }

      const response = await fetch(url);
      cache.put(url, response.clone());

      this._isLoading = false;
      return response;
    },

    async delete(cacheName) {
      checkCompatibility();
      this._isLoading = true;

      await caches.delete(cacheName);

      this._isLoading = false;
    }
  }
})
