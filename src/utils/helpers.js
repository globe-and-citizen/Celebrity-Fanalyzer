import { useStorageStore } from 'src/stores'
import { convertImage } from 'src/utils/imageConvertor'

export function onPaste(event, editorRef) {
  if (event.target.nodeName === 'INPUT') return

  let text
  let onPasteStripFormattingIEPaste = false

  event.preventDefault()
  event.stopPropagation()

  if (!editorRef || !editorRef.value) {
    console.warn('Editor reference is not available yet.')
    return
  }

  if (event.originalEvent && event.originalEvent.clipboardData?.getData) {
    text = event.originalEvent.clipboardData.getData('text/plain')
    editorRef.value.runCmd('insertText', text)
  } else if (event.clipboardData?.getData) {
    text = event.clipboardData.getData('text/plain')
    editorRef.value.runCmd('insertText', text)
  } else if (window.clipboardData?.getData) {
    if (!onPasteStripFormattingIEPaste) {
      onPasteStripFormattingIEPaste = true
      text = window.clipboardData.getData('text')
      editorRef.value.runCmd('ms-pasteTextOnly', text)
    }
    onPasteStripFormattingIEPaste = false
  }
}

export async function uploadImage(image, imagePath) {
  const storageStore = useStorageStore()
  try {
    const resizedImg = await convertImage(image)
    const fullPath = `images/${imagePath}`
    return await storageStore.uploadFile(resizedImg, fullPath)
  } catch (error) {
    console.error('Image upload failed:', error)
    throw new Error('Failed to upload image')
  }
}
