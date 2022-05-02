import { doc, getDoc } from 'firebase/firestore'
import { firebaseManager, FirebaseManager } from './firebase.services'
import { merchantService } from './merchant.service'

class OrderService {
    private db

    constructor(fm: FirebaseManager) {
        this.db = fm.getDB()
    }

    async getOrder(id: string) {
        const docRef = doc(this.db, 'orders', id)
        const docSnap = await getDoc(docRef)
        const order = docSnap.data() as Order

        const merchant = await merchantService.get(order.merchant.toString())

        return {
            ...order,
            merchant
        } as Order
    }
}

export const orderService = new OrderService(firebaseManager)
