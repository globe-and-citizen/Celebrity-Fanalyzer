import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getCountFromServer,
  query,
  runTransaction,
  setDoc,
  Timestamp,
  where
} from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { db, storage } from 'src/firebase'
import { useUserStore } from 'src/stores'
import 'firebase/firestore'

export const usePromptStore = defineStore('prompts', {
  state: () => ({
    _isLoading: false,
    _monthPrompt: null,
    _isLoaded: false,
    _prompts: []
  }),

  getters: {
    getMonthPrompt: (state) => LocalStorage.getItem('monthPrompt') || state._monthPrompt,
    getPromptRef: () => (id) => doc(db, 'prompts', id),
    getPrompts: (state) => state._prompts,
    getPromptById: (state) => (promptId) => {
      if (state._prompts !== []) return state._prompts.find((prompt) => prompt.id === promptId)
      return {}
    },
    getPromptBySlug: (state) => (promptSlug) => {
      if (state._prompts !== []) return state._prompts.find((prompt) => prompt.slug === promptSlug)
      return {}
    },
    isLoading: (state) => state._isLoading
  },

  actions: {
    async fetchMonthPrompt() {
      // TODO check if we already have a monthPrompt and if it's updated before all
      this._isLoading = true
      let month= new Date().getMonth()
      if (month<9){
        month = `0${month+1}`
      }
      const monthId = `${new Date().getFullYear()}-${month}`

      // TODO improve the use of the local storage
      // TODO Check the local storage before fetchMonthPrompt
      // TODO try to fetch prompt by id if we still don't have data after fetchPrompt
      if (this._isLoaded === false) {
        await this.fetchPrompts().then(() => this.fetchMonthPrompt())
      }
      if (this._isLoaded === true && this._prompts !== []) {
        // set the current month Prompt
        this._monthPrompt = this._prompts.find((prompt) => {
          console.log(prompt.id, monthId);
          return prompt.id === monthId
        })

        // Load Current Month Entries
        if (this._monthPrompt && !this._monthPrompt.isEntriesFetched) {
          // await this.fetchPromptEntry(this._monthPrompt.id).then(() => this.fetchMonthPrompt())
        }
      }

      console.log(this._monthPrompt.id, monthId);
      this._isLoading = false
    },
    /**
     * Fetch prompt By id if it's not exist or reload it if it's exist
     * @param promptId
     * @returns {Promise<void>}
     */
    async fetchPromptById(promptId) {
      this._isLoading = true
      await getDoc(doc(db, 'prompts', promptId))
        .then(async (doc) => {
          if (doc.data === undefined) {
            throw new Error('Document not found.')
          }
          const prompt = { id: doc.id, ...doc.data() }
          const localPrompt = this.getPromptById(prompt.id)
          if (!localPrompt) {
            prompt.author = await getDoc(prompt.author).then((doc) => doc.data())
            if (prompt.entries?.length) {
              for (const index in prompt.entries) {
                prompt.entries[index] = await getDoc(prompt.entries[index]).then((doc) => doc.data())
                prompt.entries[index].author = await getDoc(prompt.entries[index].author).then((doc) => doc.data())
              }
            }
            let index = this._prompts.findIndex((_prompt) => _prompt.id === prompt.id)
            if(index<0){
              index= 0
            }
            this._prompts[index] = prompt
          } else {
            const newPrompt = { ...prompt, ...{ entries: localPrompt.entries, author: localPrompt.author } }
            const index = this._prompts.findIndex((_prompt) => _prompt.id === prompt.id)
            this._prompts[index] = newPrompt
          }
          // await this.fetchPromptEntry(id)
          return prompt
        })
        .catch((err) => {
          throw new Error(err)
        })
        .finally(async () => {
          this._isLoading = false
        })
    },

    async fetchPromptsByYear(year) {
      const q = query(collection(db, 'prompts'), where('date', '>=', `${year}-01-01`), where('date', '<=', `${year}-12-31`))

      this._isLoading = true
      return await getDocs(q)
        .then(async (querySnapshot) => {
          const prompts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

          for (const prompt of prompts) {
            prompt.author = await getDoc(prompt.author).then((doc) => doc.data())
          }

          prompts.reverse()

          return prompts
        })
        .catch((error) => {
          console.error(error)
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async fetchPrompts() {
      // TODO check if we have data updated before  all
      this._isLoading = true
      if (this._isLoaded === false) {
        await getDocs(collection(db, 'prompts'))
          .then(async (querySnapshot) => {
            const prompts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), isEntriesFetched: false }))

            for (const prompt of prompts) {
              prompt.author = await getDoc(prompt.author).then((doc) => doc.data())
            }

            prompts.reverse()

            this._prompts = []
            this.$patch({ _prompts: prompts })
          })
          .catch((error) => {
            console.error(error)
            throw new Error(error)
          })
          .finally(() => {
            this._isLoading = false
            this._isLoaded = true
          })
      } else {
        this._isLoading = false
      }
    },

    async fetchPromptEntry(promptId) {
      this._isLoading = true
      let currentPrompt = this.getPromptById(promptId)

      // TODO: improve by saving entries in the entry store
      if (currentPrompt.entries && currentPrompt.isEntriesFetched === false) {
        for (const index in currentPrompt.entries) {
          currentPrompt.entries[index] = await getDoc(currentPrompt.entries[index]).then((doc) => doc.data())
          currentPrompt.entries[index].author = await getDoc(currentPrompt.entries[index].author).then((doc) => doc.data())
        }

        // Confirm that this Prompt Entry is fetched
        currentPrompt.isEntriesFetched = true

        // Update the current Prompt in the prompt list
        const promptIndex = this._prompts.findIndex((prompt) => prompt.id === promptId)
        this._prompts[promptIndex] = currentPrompt
      }

      this._isLoading = false
    },

    async fetchPromptsAndEntries() {
      this._isLoading = true
      await getDocs(collection(db, 'prompts'))
        .then(async (querySnapshot) => {
          const prompts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

          for (const prompt of prompts) {
            prompt.author = await getDoc(prompt.author).then((doc) => doc.data())

            if (prompt.entries) {
              for (const index in prompt.entries) {
                prompt.entries[index] = await getDoc(prompt.entries[index]).then((doc) => ({ id: doc.id, ...doc.data() }))
                prompt.entries[index].author = await getDoc(prompt.entries[index].author).then((doc) => doc.data())
              }
            }
          }

          prompts.reverse()

          this._prompts = []
          this.$patch({ _prompts: prompts })
        })
        .catch((error) => {
          console.error(error)
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async addPrompt(prompt) {
      const userStore = useUserStore()

      prompt.author = userStore.getUserRef
      prompt.created = Timestamp.fromDate(new Date())
      prompt.id = prompt.date

      this._isLoading = true
      await setDoc(doc(db, 'prompts', prompt.id), prompt)
        .then(() => {
          prompt.author = userStore.getUser
          this.$patch({ _prompts: [...this.getPrompts, prompt] })
        })
        .catch((error) => {
          console.error(error)
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async editPrompt(prompt) {
      this._isLoading = true
      await runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'prompts', prompt.id), { ...prompt })
      })
        .then(() => {
          const index = this.getPrompts.findIndex((p) => p.id === prompt.id)
          this.$patch({
            _prompts: [...this._prompts.slice(0, index), { ...this._prompts[index], ...prompt }, ...this._prompts.slice(index + 1)]
          })
        })
        .catch((error) => {
          console.error(error)
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async deletePrompt(id) {
      const relatedEntries = this._prompts.find((prompt) => prompt.id === id)?.entries || []

      this._isLoading = true
      const deleteImage = await deleteObject(ref(storage, `images/prompt-${id}`))
      const deletePromptDoc = await deleteDoc(doc(db, 'prompts', id))

      if (relatedEntries.length) {
        for (const entry of relatedEntries) {
          await deleteDoc(doc(db, 'entries', entry.id))
          await deleteObject(ref(storage, `images/entry-${entry.id}`))
        }
      }

      Promise.all([deleteImage, deletePromptDoc])
        .then(() => {
          const index = this._prompts.findIndex((prompt) => prompt.id === id)
          this._prompts.splice(index, 1)
        })
        .catch((error) => {
          console.error(error)
          throw new Error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async uploadImage(file, promptId) {
      const storageRef = ref(storage, `images/prompt-${promptId}`)

      this._isLoading = true
      await uploadBytes(storageRef, file).finally(() => (this._isLoading = false))

      return getDownloadURL(ref(storage, storageRef))
    },

    async addLike(promptId) {
      this._isLoading = true
      await useUserStore().loadBrowserId()
      const browserId = useUserStore().getBrowserId
      const userOpinionRef = doc(db, 'prompts', promptId, 'opinions', browserId)
      // First load prompt stored in the store
      let userOpinion = await getDoc(userOpinionRef).then((doc) => doc.data())
      if (userOpinion && !userOpinion.liked) {
        await setDoc(userOpinionRef, { ...userOpinion, liked: true, updatedAd: Date.now() })
      } else if (!userOpinion) {
        await setDoc(userOpinionRef, {
          liked: true,
          createdAt: Date.now(),
          updatedAd: Date.now()
        })
      }

      await this.refreshPromptOpinion(promptId)
      this._isLoading = false
    },

    async addDislike(promptId) {
      this._isLoading = true
      let browserId
      await useUserStore()
        .loadBrowserId()
        .then(() => {
          browserId = useUserStore().getBrowserId
        })
      const userOpinionRef = doc(db, 'prompts', promptId, 'opinions', browserId)
      // First load prompt stored in the store
      let userOpinion = await getDoc(userOpinionRef).then((doc) => doc.data())
      if (userOpinion && userOpinion.liked) {
        await setDoc(userOpinionRef, { ...userOpinion, liked: false, updatedAd: Date.now() })
      } else if (!userOpinion) {
        await setDoc(userOpinionRef, {
          liked: true,
          createdAt: Date.now(),
          updatedAd: Date.now()
        })
      }
      await this.refreshPromptOpinion(promptId)
      this._isLoading = false
    },
    /**
     *
     * @param promptId
     * @returns {Promise<void>}
     */
    async refreshPromptOpinion(promptId) {
      this._isLoading = true
      const likeQuery_ = query(collection(db, 'prompts', promptId, 'opinions'), where('liked', '==', true))
      const dislikeQuery_ = query(collection(db, 'prompts', promptId, 'opinions'), where('liked', '==', false))

      const likeSnapshot = await getCountFromServer(likeQuery_)
      const dislikeSnapshot = await getCountFromServer(dislikeQuery_)

      const likesCount = likeSnapshot.data().count
      const dislikesCount = dislikeSnapshot.data().count

      const index = this._prompts.findIndex((prompt) => {
        return prompt.id === promptId
      })

      let statePrompt = this.getPromptById(promptId)
      if (index >= 0 && statePrompt !== {}) {
        this._prompts[index] = { ...statePrompt, likesCount, dislikesCount }
      }

      this._isLoading = false
    }
  }
})
