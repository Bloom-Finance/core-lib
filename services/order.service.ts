import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
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

    async addStripePayment(orderId: string, paymentInfo: any) {
        const payment: Payment = {
            id: nanoid(),
            date: new Date().getTime(),
            order_id: orderId,
            pay_with: {
                stripe: paymentInfo
            }
        }

        await setDoc(
            doc(firebaseManager.getDB(), 'payments', payment.id),
            payment
        )

        const storedOrder = await doc(
            firebaseManager.getDB(),
            'orders',
            orderId
        )

        await updateDoc(storedOrder, {
            status: 'PAYED',
            payment_info: {
                issued_at: new Date().getTime(),
                payment_id: payment.id
            }
        })
    }
}

export const orderService = new OrderService(firebaseManager)
