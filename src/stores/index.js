import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { store } from 'quasar/wrappers'
import SecureLS from 'secure-ls'
import { useCommentStore } from './comments'
import { useEntryStore } from './entries'
import { useErrorStore } from './errors'
import { useFeedbackStore } from './feedbacks'
import { useLikeStore } from './likes'
import { useNotificationStore } from './notifications'
import { usePromptStore } from './prompts'
import { useRequestStore } from './requests'
import { useShareStore } from './shares'
import { useStorageStore } from './storage'
import { useUserStore } from './user'
import { useVisitorStore } from './visitors'
/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default store((/* { ssrContext } */) => {
  const pinia = createPinia()

  pinia.use(
    createPersistedState({
      storage: {
        getItem: (key) => {
          return new SecureLS().get(key)
        },
        setItem: (key, value) => {
          new SecureLS().set(key, value)
        }
      }
    })
  )
  // You can add Pinia plugins here
  // pinia.use(SomePiniaPlugin)

  return pinia
})

export {
  useCommentStore,
  useEntryStore,
  useErrorStore,
  useFeedbackStore,
  useLikeStore,
  useNotificationStore,
  usePromptStore,
  useRequestStore,
  useShareStore,
  useStorageStore,
  useUserStore,
  useVisitorStore
}
