import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './config'

/**
 * Upload a document file to Firebase Storage.
 * Files are stored under printjobs/{userId}/{timestamp}_{filename}
 * and should be deleted after printing is confirmed.
 */
export const uploadDocument = (file, userId, onProgress) => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now()
    const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const storageRef = ref(storage, `printjobs/${userId}/${filename}`)

    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        uploadedBy: userId,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    })

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        if (onProgress) onProgress(Math.round(progress))
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        resolve({
          url: downloadURL,
          path: `printjobs/${userId}/${filename}`,
          name: file.name,
          size: file.size,
          type: file.type,
        })
      }
    )
  })
}

/**
 * Delete a file from storage after job completion.
 * This is the privacy-first approach — files are removed after printing.
 */
export const deleteDocument = async (filePath) => {
  try {
    const storageRef = ref(storage, filePath)
    await deleteObject(storageRef)
    return true
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}

/**
 * Get the page count of a PDF file (client-side estimate).
 * For production, use a PDF.js based approach.
 */
export const estimatePageCount = (fileSize, fileType) => {
  if (fileType === 'application/pdf') {
    // Rough estimate: ~100KB per page
    return Math.max(1, Math.round(fileSize / 102400))
  }
  if (fileType.startsWith('image/')) {
    return 1
  }
  // DOC/DOCX: rough estimate ~3KB per page
  return Math.max(1, Math.round(fileSize / 3072))
}
