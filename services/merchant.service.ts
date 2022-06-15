import { FirebaseManager, firebaseManager } from './firebase.services'
import { getDoc } from '@firebase/firestore'
import { doc } from 'firebase/firestore'

const COLLECTION = 'merchant'

interface IMerchantService {
    get(id: string): Promise<Merchant>
}

class MerchantService implements IMerchantService {
    private db

    constructor(fm: FirebaseManager) {
        this.db = fm.getDB()
    }

    async get(id: string): Promise<Merchant> {
        const docRef = doc(this.db, COLLECTION, id.toString())
        const docSnap = await getDoc(docRef)
        const merchant = docSnap.data()
        return merchant as Merchant
    }
}

export const merchantService = new MerchantService(firebaseManager)
