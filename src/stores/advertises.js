import { defineStore } from 'pinia'

export const useAdvertiseStore = defineStore('advertises', {
  state: () => ({
    _isLoading: false,
    _advertises: [],
    _tab: 'post'
  }),

  persist: true,

  getters: {
    // getAdvertiseRef: () => (id) => doc(db, 'prompts', id),
    getAdvertises: (state) => state._prompts,
    isLoading: (state) => state._isLoading,
    tab: (state) => state._tab
  },

  actions: {
    async fetchAdvertises() {
      const userStore = useUserStore()

      if (!userStore.getUsers) {
        await userStore.fetchAdminsAndWriters()
      }

      this._isLoading = true
      // onSnapshot(collection(db, 'prompts'), async (querySnapshot) => {
      //   const prompts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      //   for (const prompt of prompts) {
      //     prompt.author = userStore.getUserById(prompt.author.id) || (await userStore.fetchUser(prompt.author.id))
      //     prompt.entries = prompt.entries?.map((entry) => entry.id)
      //   }

      //   prompts.reverse()

      //   this._prompts = []
      //   this.$patch({ _prompts: prompts })
      // })
      this._isLoading = false
    },

    async addAdvertise(payload) {
      const advertise = { ...payload }

      advertise.author = doc(db, 'users', advertise.author.value)
      advertise.created = Timestamp.fromDate(new Date())
      advertise.id = advertise.date

      this._isLoading = true
      this._advertises.push(advertise)
      this._isLoading = false
      console.log(this._advertises)
    },

    async editAdvertise(payload) {
      const prompt = { ...payload }

      prompt.author = doc(db, 'users', prompt.author.value)
      prompt.updated = Timestamp.fromDate(new Date())

      this._isLoading = true
      this._advertises = this._advertises.map((advertise) => {
        if (advertise.id === prompt.id) return prompt
        return advertise
      })
      this._isLoading = false
    },

    async deleteAdvertise(id) {
      this._isLoading = true
      this._advertises = this._advertises.filter((advertise) => advertise.id === id)

      this._isLoading = false
    },

    setTab(tab) {
      this.$patch({ _tab: tab })
    }
  }
})
