import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

import {
    ref,
    getStorage,
    uploadBytes,
    UploadResult,
    deleteObject,
    getMetadata,
    FullMetadata,
    getDownloadURL,
    connectStorageEmulator
} from 'firebase/storage'

const RUNTIME = process.env.RUNTIME || 'DEV'

export class FirebaseManager {
    private firebaseApp: any
    private storage: any
    private realTimeDB: any
    private db: any = null
    private pubSub: any

    constructor() {
        if (RUNTIME === 'DEV') {
            this.firebaseApp = initializeApp({ projectId: 'bloom-trade' })
            this.db = getFirestore()
            connectFirestoreEmulator(this.db, 'localhost', 8080)
            this.storage = getStorage(
                undefined,
                'gs://bloom-trade.appspot.com/'
            )
            connectStorageEmulator(this.storage, 'localhost', 9199)
        }

        if (RUNTIME !== 'DEV' && process.env.FIREBASE) {
            this.firebaseApp = initializeApp(
                JSON.parse(
                    Buffer.from(
                        process.env.FIREBASE as string,
                        'base64'
                    ).toString()
                )
            )
        }
    }
    getDB() {
        if (RUNTIME === 'DEV') return this.db
        else return getFirestore()
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

    async uploadFile(file: File, storagePath?: string): Promise<UploadResult> {
        const storageRef = ref(
            this.storage,
            `${storagePath || ''}/${file.name}`
        )
        return uploadBytes(storageRef, file)
    }

    deleteFile(fileName: any): Promise<any> {
        const storageRef = ref(this.storage, `files/${fileName}`)
        return deleteObject(storageRef)
    }

    getFileBlobUrl(fullPath: string): Promise<string> {
        const storageRef = ref(this.storage, fullPath)
        return getDownloadURL(storageRef)
    }

    getFile(fileName: any) {
        const listRef = ref(this.storage, `${fileName}`)
        return getMetadata(listRef)
    }
    async getFileUrl(fullPath: string) {
        return getDownloadURL(ref(this.storage, fullPath))
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
