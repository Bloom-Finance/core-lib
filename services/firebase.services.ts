import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import {
    ref,
    getStorage,
    uploadBytes,
    UploadResult,
    deleteObject,
    getMetadata,
    FullMetadata,
    getDownloadURL
} from 'firebase/storage'
import { getDatabase } from 'firebase/database'

class FirebaseManager {
    private firebaseApp: any
    private storage: any
    private realTimeDB: any
    constructor() {
        if (process.env.FIREBASE) {
            this.firebaseApp = initializeApp(
                JSON.parse(
                    Buffer.from(
                        process.env.FIREBASE as string,
                        'base64'
                    ).toString()
                )
            )
            this.storage = getStorage()
            this.realTimeDB = getDatabase()
        } else {
            console.log('vacio')
        }
    }

    getDB() {
        return getFirestore()
    }
    getRealTimeDB() {
        return this.realTimeDB
    }
    getAuth() {
        return this.firebaseApp.getAuth()
    }

    getFirebaseApp() {
        return this.firebaseApp
    }

    uploadFile(file: File, storagePath?: string): Promise<UploadResult> {
        const storageRef = ref(
            this.storage,
            `${storagePath || 'images'}/${file.name}`
        )
        return uploadBytes(storageRef, file)
    }
    deleteFile(fileName: string, storagePath: string): Promise<void> {
        const storageRef = ref(this.storage, `${storagePath}/${fileName}`)
        return deleteObject(storageRef)
    }
    getFileBlobUrl(fullPath: string): Promise<string> {
        const storageRef = ref(this.storage, fullPath)
        return getDownloadURL(storageRef)
    }
    async getFileMetadata(
        fileName: string,
        storagePath: string
    ): Promise<FullMetadata> {
        const storageRef = ref(this.storage, `${storagePath}/${fileName}`)
        return getMetadata(storageRef)
    }
}

export const firebaseManager = new FirebaseManager()
