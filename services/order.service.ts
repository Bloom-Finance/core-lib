import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    where,
    query
} from 'firebase/firestore'
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
    async getOrdersByMerchant(merchant_id: string) {
        const docRef = await collection(firebaseManager.getDB(), 'orders')
        const q = await query(docRef, where('merchant', '==', merchant_id))
        const querySnapshot = await getDocs(q)
        const orders: any[] = []
        querySnapshot.forEach(doc => {
            orders.push(doc.data())
        })
        return orders as Order[]
    }
    async newOrder(
        order: Order,
        access_token?: string,
        customer?: string,
        item?: string
    ) {
        try {
            await setDoc(
                doc(firebaseManager.getDB(), 'orders', order.id),
                order
            )
            let total_amount = 0
            order.items.forEach(v => {
                total_amount += v.amount
            })
            const amountToSave = total_amount.toString()
            await axios.post('/api/order/new', {
                order,
                access_token,
                customer,
                item,
                total_amount: amountToSave
            })
        } catch (error) {
            console.error(error)
        }
    }
    async addPayment(orderId: string, paymentInfo: any) {
        const pay_with: any = {}
        // si es preorder ejecuta crear el order
        if (paymentInfo.payment_type === 'CREDIT CARD')
            pay_with.stripe = paymentInfo

        if (paymentInfo.payment_type === 'BANK TRANSFER')
            pay_with.bank_transfer = paymentInfo

        if (paymentInfo.payment_type === 'CRYPTO') pay_with.crypto = paymentInfo

        Object.assign(pay_with, { payment_type: paymentInfo.payment_type })
        const payment: Payment = {
            id: nanoid(),
            date: new Date().getTime(),
            order_id: orderId,
            pay_with,
            status:
                paymentInfo.payment_type === 'BANK TRANSFER'
                    ? 'IN REVIEW'
                    : 'CONFIRMED'
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
                paymentInfo.payment_type === 'BANK TRANSFER'
                    ? 'IN REVIEW'
                    : 'PAYED',
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
