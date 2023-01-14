import { Firestore } from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { defineStore } from 'pinia'
import { db, storage } from 'src/firebase'

const mockedDatabase = {
  _data: [
    {
      id: 1,
      text: 'Run unit tests on a store',
      completed: true
    },
    {
      id: 2,
      text: 'Mock an asynchronous DB',
      completed: false
    },
    {
      id: 3,
      text: 'Figure our how to approximate the Firebase API',
      completed: false
    },
    {
      id: 4,
      text: 'Report to the team',
      completed: false
    }
  ],
  getAllData: () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(mockedDatabase._data)
      }, 3000)
    })
  }
}

export const useTodoStore = defineStore('todoApp', {
  state: () => ({
    _isLoading: false,
    _todos: []
  }),

  getters: {
    getIsLoading: (state) => state._isLoading,
    getTodos: (state) => _todos
  },

  actions: {
    async fetchData() {
      return mockedDatabase.getAllData() // returns a promise
    }
  }
})
