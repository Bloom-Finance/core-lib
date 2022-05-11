import { doc, getDoc } from 'firebase/firestore'
import { firebaseManager, FirebaseManager } from './firebase.services'
import { merchantService } from './merchant.service'
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)

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

    async addPayment(order: Order) {
        const payment: Payment = {
            id: nanoid()
        }
    }
}

export const orderService = new OrderService(firebaseManager)
