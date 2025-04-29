import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  or,
  query,
  runTransaction,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  limit,
  startAfter,
  orderBy
} from 'firebase/firestore'
import { deleteObject, ref } from 'firebase/storage'
import { defineStore } from 'pinia'
import { db, storage } from 'src/firebase'
import {
  useCommentStore,
  useErrorStore,
  useLikeStore,
  useNotificationStore,
  usePromptStore,
  useShareStore,
  useStatStore,
  useUserStore,
  useVisitorStore
} from 'src/stores'
import { uploadImage } from 'src/utils/helpers'
import { uid } from 'quasar'

function snapshotDocs(querySnapshot) {
  const entries = []
  for (const doc of querySnapshot) {
    const entryData = doc.data()
    const promptId = entryData.prompt.id

    const entry = {
      id: doc.id,
      prompt: promptId,
      ...entryData
    }
    entries.push(entry)
  }
  return entries
}

export const useEntryStore = defineStore('entries', {
  state: () => ({
    _entries: [],
    _isLoading: false,
    _unSubscribe: undefined,
    _tab: 'post',
    entryDialog: {},
    userRelatedEntries: [],
    _loadedEntries: [],
    loadCount: 5,
    _lastVisibleEntry: null,
    showLastVisible: true
  }),

  // persist: true,

  getters: {
    getEntries: (state) => state._entries,
    resetEntries: (state) => (state._entries = undefined),
    isLoading: (state) => state._isLoading,
    tab: (state) => state._tab,
    getUserRelatedEntries: (state) => state.userRelatedEntries,
    getLoadedEntries: (state) => state._loadedEntries
  },

  actions: {
    async fetchEntries() {
      const userStore = useUserStore()

      try {
        this._isLoading = true
        const querySnapshot = await getDocs(collection(db, 'entries'))
        const entries = snapshotDocs(querySnapshot.docs)
        for (const entry of entries) {
          if (entry.author.id) {
            entry.author = userStore.getUserById(entry.author.id) || (await userStore.fetchUser(entry.author.id))
          }
        }
        this._entries = entries
      } catch (e) {
        console.error(e)
      } finally {
        this._isLoading = false
      }
    },

    async fetchUserRelatedEntries(userId, pagination = false) {
      const userStore = useUserStore()

      try {
        this._isLoading = true

        const userDocRef = doc(db, 'users', userId)

        const conditions = [where('author', '==', userDocRef)]
        if (pagination) {
          conditions.push(limit(this.loadCount), orderBy('created', 'desc'))
        }
        if (this._lastVisibleEntry) {
          conditions.push(startAfter(this._lastVisibleEntry))
        }

        const querySnapshot = await getDocs(query(collection(db, 'entries'), ...conditions))
        const entries = snapshotDocs(querySnapshot.docs)

        if (pagination) {
          this._lastVisibleEntry = querySnapshot.docs[querySnapshot.docs.length - 1]
        }

        for (const entry of entries) {
          const promptId = entry.prompt.id
          if (entry.author.id) {
            entry.author = userStore.getUserById(entry.author.id) || (await userStore.fetchUser(entry.author.id))
          }

          const promptSnapshot = await getDocs(query(collection(db, 'prompts'), where('id', '==', promptId)))
          const prompt = promptSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0]
          entry.prompt = prompt

          if (!entry.escrowId) {
            entry.escrowId = prompt?.escrowId
          }
        }

        this.userRelatedEntries = pagination ? [...this.userRelatedEntries, ...entries] : entries
        if (entries.length < 5 && pagination) {
          this.showLastVisible = false
        }
      } catch (e) {
        console.error(e)
      } finally {
        this._isLoading = false
      }
    },

    async fetchPromptsEntries(slugArray) {
      const userStore = useUserStore()
      try {
        this._isLoading = true

        let allEntries = []

        for (let i = 0; i < slugArray.length; i += 30) {
          const chunk = slugArray.slice(i, i + 30)
          const querySnapshot = await getDocs(query(collection(db, 'entries'), where('id', 'in', chunk)))
          const chunkEntries = querySnapshot.docs.map(async (doc) => {
            const entry = { id: doc.id, ...doc.data() }
            if (entry.author && entry.author.id) {
              entry.author = userStore.getUserById(entry.author.id) || (await userStore.fetchUser(entry.author.id))
            }
            return entry
          })
          const resolvedChunkEntries = await Promise.all(chunkEntries)
          allEntries = allEntries.concat(resolvedChunkEntries)
        }
        this._entries = allEntries
        this._isLoading = false
        return allEntries
      } catch (e) {
        console.error('Error fetching entries entries', e)
      }
    },

    async fetchEntryBySlug(slug, ignoreId = false) {
      const userStore = useUserStore()
      const promptStore = usePromptStore()
      const id = slug.slice(1, -3).replace('/', '-').replace('/', '')
      try {
        this._isLoading = true
        const conditions = [where('slug', '==', slug), where('id', '==', id)]
        if (ignoreId) {
          conditions.pop()
        }
        const querySnapshot = await getDocs(
          query(collection(db, 'entries'), conditions.length > 1 ? or(...conditions) : where('slug', '==', slug))
        )
        const entry = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0]
        if (entry.author.id) {
          entry.author = userStore.getUserById(entry.author.id) || (await userStore.fetchUser(entry.author.id))
        }
        this._isLoading = false
        this._entries = [entry]
      } catch (e) {
        await promptStore.redirect()
        console.error('Unable to fetch entry', e)
      }
    },
    async fetchEntryByPrompts(promptId) {
      const userStore = useUserStore()
      if (!promptId) {
        console.error('No promptId provided')
        this._entries = []
        return
      }

      const promptDocRef = doc(db, 'prompts', promptId)

      try {
        const querySnapshot = await getDocs(query(collection(db, 'entries'), where('prompt', '==', promptDocRef)))
        const entries = snapshotDocs(querySnapshot.docs)

        const userPromises = entries.map(async (entry) => {
          if (entry.author.id) {
            entry.author = userStore.getUserById(entry.author.id) || (await userStore.fetchUser(entry.author.id))
          }
          return entry
        })

        this._entries = await Promise.all(userPromises)
      } catch (e) {
        console.error('Unable to fetch entries', e)
        this._entries = []
      }
    },

    hasEntry(promptId) {
      const userStore = useUserStore()
      if (!this.getEntries || !promptId) return false
      const filteredEntry = this.getEntries.filter((entry) => entry.author.uid === userStore.getUserId && entry.prompt.id === promptId)
      return !!filteredEntry.length
    },

    entryNameValidator(entryId, promptId, title, isEdit = false) {
      if (!this.getEntries || !promptId || !title) return false
      const filteredEntry = this.getEntries.filter((entry) =>
        isEdit
          ? entryId !== entry?.id && entry.title === title && promptId === entry.prompt.id
          : entry.title === title && promptId === entry.prompt.id
      )
      return !!filteredEntry.length
    },

    checkPromptRelatedEntry(promptId) {
      if (!this.getEntries || !promptId) return false
      return !!this.getEntries.find((entry) => entry.prompt.id === promptId)
    },

    async addEntry(payload) {
      this._isLoading = true
      const notificationStore = useNotificationStore()
      const promptStore = usePromptStore()
      const entry = { ...payload }

      const promptId = entry.prompt.value
      const escrowId = entry.prompt.escrowId
      const entryRef = doc(db, 'entries', entry.id)
      entry.author = doc(db, 'users', entry.author.value)
      entry.created = Timestamp.fromDate(new Date())
      entry.prompt = promptStore.getPromptRef(entry.prompt.value)
      entry.escrowId = escrowId || null

      delete entry.image
      delete entry.imagePath

      if (!entry.imageFile) {
        delete entry.imageFile
      } else if (entry.imageFile instanceof Blob) {
        entry.image = await uploadImage(entry.imageFile, `entry-${entry.id}`)
        delete entry.imageFile
      }
      if (!entry.showcase?.artist.file) {
        delete entry.imageFile
      } else if (entry.showcase?.artist.file instanceof Blob) {
        entry.showcase.artist.preview = await uploadImage(entry.showcase.artist.file, `artist-${entry.id}`)
        delete entry.showcase.artist.file
        delete entry.showcase.artist.photo
      }

      if (entry.showcase?.arts?.length > 0) {
        try {
          const uploadedArts = []
          for (const art of entry.showcase.arts) {
            if (art.file instanceof Blob) {
              const imagePath = `arts/arts-${uid()}`
              const downloadUrl = await uploadImage(art.file, imagePath)
              uploadedArts.push({ preview: downloadUrl })
            } else {
              uploadedArts.push({ preview: art.url || '' })
            }
          }
          entry.showcase.arts = uploadedArts
        } catch (error) {
          console.error('Image upload failed:', error)
          this._isLoading = false
          throw new Error('Failed to upload image')
        }
      }

      try {
        await setDoc(entryRef, entry)
        await updateDoc(doc(db, 'prompts', promptId), { entries: arrayUnion(entryRef) })
        await notificationStore.toggleSubscription('entries', entry.id)
      } catch (error) {
        console.error('Failed to add entry:', error)
        throw error
      } finally {
        this._isLoading = false
      }
    },

    async editEntry(payload) {
      this._isLoading = true
      const promptStore = usePromptStore()
      const entry = { ...payload }
      const artsToRemove = entry.artsToRemove
      const artistImageToRemove = entry.artistImageToRemove
      entry.author = doc(db, 'users', entry.author.value)
      entry.prompt = promptStore.getPromptRef(entry.prompt.value)
      entry.updated = Timestamp.fromDate(new Date())

      delete entry.imagePreview
      delete entry.selectedPromptDate
      delete entry.isNavigatingFromPrompt

      if (artsToRemove?.length) {
        for (const art of artsToRemove) {
          const imageRef = ref(storage, art)
          await deleteObject(imageRef)
        }
        delete entry.artsToRemove
      } else {
        delete entry.artsToRemove
      }

      if (artistImageToRemove) {
        const artistImageRef = ref(storage, artistImageToRemove)
        await deleteObject(artistImageRef)
        delete entry.artistImageToRemove
      } else {
        delete entry.artistImageToRemove
      }

      if (!entry.imageFile) {
        delete entry.imageFile
      } else if (entry.imageFile instanceof Blob) {
        entry.image = await uploadImage(entry.imageFile, `entry-${entry.id}`)
        delete entry.imageFile
      }

      if (entry.showcase?.arts?.length > 0) {
        try {
          const uploadedArts = []
          for (const art of entry.showcase.arts) {
            if (art.file instanceof Blob) {
              const imagePath = `arts/arts-${uid()}`
              const downloadUrl = await uploadImage(art.file, imagePath)
              uploadedArts.push({ preview: downloadUrl })
            } else {
              uploadedArts.push({ preview: art.preview || '' })
            }
          }
          entry.showcase.arts = uploadedArts
        } catch (error) {
          console.error('Image upload failed:', error)
          this._isLoading = false
          throw new Error('Failed to upload image')
        }
      }

      if (!entry.showcase?.artist.file) {
        delete entry.imageFile
      } else if (entry.showcase?.artist.file instanceof Blob) {
        entry.showcase.artist.preview = await uploadImage(entry.showcase.artist.file, `artist-${entry.id}`)
        delete entry.showcase.artist.file
        delete entry.showcase.artist.photo
      }

      await runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'entries', entry.id), { ...entry })
      })
      const prompt = promptStore.getPromptRef(entry.prompt?.id)
      const updatedEntryDoc = await getDoc(doc(db, 'entries', entry.id))
      const updatedPromptDoc = await getDoc(doc(db, 'prompts', prompt.id))

      this._isLoading = false
      return {
        _entry: updatedEntryDoc.data(),
        _prompt: updatedPromptDoc.data()
      }
    },

    //update not coming from form submission
    async dataUpdateEntry(payload) {
      const promptStore = usePromptStore()
      const prompt = promptStore.getPromptRef(payload.entry.prompt?.id)

      await runTransaction(db, async (transaction) => {
        transaction.update(doc(db, 'prompts', prompt.id), {
          hasWinner: payload.isWinner === true,
          updated: Timestamp.fromDate(new Date())
        })
        transaction.update(doc(db, 'entries', payload.entry.id), { isWinner: payload.isWinner, updated: Timestamp.fromDate(new Date()) })
      })

      // Fetch updated documents separately after the transaction
      const updatedEntryDoc = await getDoc(doc(db, 'entries', payload.entry.id))
      const updatedPromptDoc = await getDoc(doc(db, 'prompts', prompt.id))

      return {
        _entry: updatedEntryDoc.data(),
        _prompt: updatedPromptDoc.data()
      }
    },

    async deleteEntry(entry) {
      let entryData
      const entryRef = entry.length ? doc(db, 'entries', entry) : doc(db, 'entries', entry.id)
      const commentStore = useCommentStore()
      const errorStore = useErrorStore()
      const likeStore = useLikeStore()
      const shareStore = useShareStore()
      const visitorStore = useVisitorStore()
      const statStore = useStatStore()

      // If "entry" is an id, get the entry reference
      if (entry.length) {
        if (entryRef) {
          const entryDoc = await getDoc(entryRef)
          entryData = entryDoc.data()
        }
      } else {
        entryData = entry
      }

      const promptId = entryData.prompt?.id.split('T')[0]
      const entryId = entryData.id
      const arts = entryData.showcase?.arts
      const artistImage = entryData.showcase?.artist.preview

      this._isLoading = true

      try {
        const deleteImage = deleteObject(ref(storage, `images/entry-${entryId}`))
        const deleteComments = commentStore.deleteCommentsCollection('entries', entryId)
        const deleteLikes = likeStore.deleteAllLikesDislikes('entries', entryId)
        const deleteShares = shareStore.deleteAllShares('entries', entryId)
        const deleteVisitors = visitorStore.deleteAllVisitors('entries', entryId)
        const deleteEntryRef = updateDoc(doc(db, 'prompts', promptId), { entries: arrayRemove(entryRef) })
        const deleteEntryDoc = deleteDoc(doc(db, 'entries', entryId))
        const deleteEntryFromStats = statStore.removeArticle(entryId)

        await Promise.all([
          deleteImage,
          deleteEntryDoc,
          deleteEntryRef,
          deleteComments,
          deleteLikes,
          deleteShares,
          deleteVisitors,
          deleteEntryFromStats
        ])

        if (arts && arts.length) {
          for (const art of arts) {
            if (art.preview?.length) {
              const imageRef = ref(storage, art.preview)
              await deleteObject(imageRef)
            }
          }
        }

        if (artistImage?.length) {
          const imageRef = ref(storage, artistImage)
          await deleteObject(imageRef)
        }

        this._entries = this._entries?.filter((entry) => entry.id !== entryId)
      } catch (error) {
        await errorStore.throwError(error, 'Error deleting entry')
      }
      this._isLoading = false
    },

    setTab(tab) {
      this.$patch({ _tab: tab })
    }
  }
})
