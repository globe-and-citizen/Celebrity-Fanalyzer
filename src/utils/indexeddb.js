import Dexie from 'dexie'

export const indexedDb = new Dexie('myDatabase')

indexedDb.version(1).stores({
  entry: '++id, author, description, id, image, imageFile, imagePath, prompt, showcase, slug, title',
  prompt:
    '++id, author, description, image, imageFile, showcase, slug, title, publicationDate, endDate, categories, creationDate, paymentStatus, rewardAmount, imagePath',
  ad: '++id, budget, campaignCode, contentURL, id, endDate, content, image, imageFile, title, productLink, publishDate, type, duration, usdAmount'
})
