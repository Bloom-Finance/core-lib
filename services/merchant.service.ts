import { firebaseManager } from './firebase.services'
import { setDoc, getDoc } from '@firebase/firestore'
import { doc } from 'firebase/firestore'
import { ref } from 'firebase/storage'

interface IMerchantService {
    get(id: string): Promise<Merchant>
}

class MerchantService implements IMerchantService {
    async get(id: string): Promise<Merchant> {
        const docRef = doc(firebaseManager.getDB(), 'merchants', id)
        const docSnap = await getDoc(docRef)
        return docSnap.data() as Merchant
    }
}

export const merchantService = new MerchantService()
