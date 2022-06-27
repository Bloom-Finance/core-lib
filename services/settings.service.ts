import { doc, getDoc } from 'firebase/firestore'
import { firebaseManager, FirebaseManager } from './firebase.services'

class BloomSettings {
    private db

    constructor(fm: FirebaseManager) {
        this.db = fm.getDB()
    }

    async getGasPrice(): Promise<GasPrice | null> {
        const docRef = doc(this.db, 'settings', 'crypto')
        const docSnap = await getDoc(docRef)

        return docSnap ? docSnap.data()?.gas_price : null
    }
}

export const bloomSettings = new BloomSettings(firebaseManager)
