import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createStore, del, get, set } from 'idb-keyval'
import { experimental_createPersister } from '@tanstack/query-persist-client-core'
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined'

export function newIdbStorage(idbStore) {
  return {
    getItem: async (key) => await get(key, idbStore),
    setItem: async (key, value) => await set(key, value, idbStore),
    removeItem: async (key) => await del(key, idbStore)
  }
}
export default ({ app }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        persister: !isBrowser
          ? undefined
          : experimental_createPersister({
              storage: newIdbStorage(createStore('db_name', 'store_name')),
              maxAge: Infinity
            }),

        networkMode: 'offlineFirst',
        refetchOnReconnect: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchInterval: 60000,
        retry: 2,
        // 12 hours
        staleTime: 12 * 60 * 60 * 1000
      }
    }
  })

  app.use(VueQueryPlugin, {
    queryClient
  })
}
