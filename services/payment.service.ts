import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { firebaseManager, FirebaseManager } from './firebase.services'
import { merchantService } from './merchant.service'
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)

class PaymentService {
    private db

    constructor(fm: FirebaseManager) {
        this.db = fm.getDB()
    }

    async getPayment(id: string) {
        const docRef = doc(this.db, 'payments', id)
        const docSnap = await getDoc(docRef)
        const payment = docSnap.data() as Payment
        return payment
    }
}

export const paymentService = new PaymentService(firebaseManager)
