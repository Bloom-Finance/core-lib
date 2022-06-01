import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { firebaseManager, FirebaseManager } from './firebase.services'
import { merchantService } from './merchant.service'
import { customAlphabet } from 'nanoid'
import axios from 'axios'
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

        if (!order) return null

        const merchant = await merchantService.get(order.merchant.toString())
        return {
            ...order,
            merchant
        } as unknown as Order
    }
    async newOrder(order: Order, access_token: string) {
        try {
            await setDoc(
                doc(firebaseManager.getDB(), 'orders', order.id),
                order
            )
            await axios.post('/api/order/new', { order, access_token })
            // Informar el order al topic
        } catch (error) {
            console.error(error)
        }
    }
    async addPayment(orderId: string, paymentInfo: any) {
        const pay_with: any = {}

        if (paymentInfo.payment_type === 'CREDIT CARD')
            pay_with.stripe = paymentInfo

        if (paymentInfo.payment_type === 'BANK TRANSFER')
            pay_with.bank_transfer = paymentInfo

        const payment: Payment = {
            id: nanoid(),
            date: new Date().getTime(),
            order_id: orderId,
            pay_with,
            status:
                paymentInfo.payment_type === 'CREDIT CARD'
                    ? 'CONFIRMED'
                    : 'IN REVIEW'
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
            status:
                paymentInfo.payment_type === 'CREDIT CARD'
                    ? 'PAYED'
                    : 'IN REVIEW',
            payment_info: {
                issued_at: new Date().getTime(),
                payment_id: payment.id
            }
        })

        if (paymentInfo.payment_type !== 'BANK TRANSFER') {
            axios.post('/api/order/inform_payment', {
                order_id: orderId
            })
        }
    }

    async updateConsumerEmail(orderId: string, email: string) {
        const storedOrder = await doc(
            firebaseManager.getDB(),
            'orders',
            orderId
        )

        const orderData = (await (await getDoc(storedOrder)).data()) as Order

        await updateDoc(storedOrder, {
            consumer_info: {
                ...orderData.consumer_info,
                email
            }
        })
    }
}

export const orderService = new OrderService(firebaseManager)
