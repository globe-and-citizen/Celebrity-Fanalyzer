import { currentYearMonth } from 'src/utils/date'
import { db } from 'src/firebase'
import { collection, doc, getDoc, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { useUserStore } from 'src/stores'

export async function fetchMonth() {
  const userStore = useUserStore()

  try {
    // Ensure users are loaded only once
    // if (!userStore.getUsers) {
    //   await userStore.fetchAdminsAndEditors()
    // }

    const promptDocRef = doc(db, 'prompts', currentYearMonth())

    // Function to get prompt data
    const getPromptData = async () => {
      const promptSnapshotRef = await getDoc(promptDocRef)
      if (promptSnapshotRef.exists()) {
        return { id: promptSnapshotRef.id, ...promptSnapshotRef.data() }
      } else {
        const lastPromptAvailableRef = await getDocs(query(collection(db, 'prompts'), orderBy('created', 'desc'), limit(1)))
        const lastPrompt = lastPromptAvailableRef.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0]
        return lastPrompt
      }
    }

    const promptData = await getPromptData()

    // Fetch author details if needed
    if (promptData?.author?.id) {
      const authorId = promptData.author.id
      promptData.author = userStore.getUserById(authorId) || (await userStore.fetchUser(authorId))
    }

    return [
      {
        ...promptData,
        entries: promptData?.entries?.map((entry) => entry.id) || []
      }
    ]
  } catch (e) {
    console.error("Error fetching month's prompts:", e)
    return []
  }
}
