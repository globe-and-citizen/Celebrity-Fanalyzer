import { db } from 'src/firebase'
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { useUserStore } from 'src/stores'

export async function fetchMonth() {
  const userStore = useUserStore()

  try {
    const querySnapshot = await getDocs(query(collection(db, 'prompts'), where('monthPrompt', '==', true)))
    const promptData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0]

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

export async function updateMonthPrompt(oldMonthPromptId, newMonthPromptId) {
  try {
    await updateDoc(doc(db, 'prompts', newMonthPromptId), { monthPrompt: true })
    await updateDoc(doc(db, 'prompts', oldMonthPromptId), { monthPrompt: false })
  } catch (e) {
    console.error(e)
  }
}
