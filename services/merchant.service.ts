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
        const docRef = doc(firebaseManager.getDB(), COLLECTION, id)
        const docSnap = await getDoc(docRef)
        return docSnap.data() as Merchant
    }
}

export const merchantService = new MerchantService(firebaseManager)
