import { setDoc, getDoc, getDocs, orderBy } from '@firebase/firestore'
import {
    collection,
    doc,
    query,
    Query,
    where,
    onSnapshot
} from 'firebase/firestore'
import { firebaseManager } from './firebase.services'
import { ErrorHandler } from '../common/helpers/errorHandler'
import {
    equalTo,
    get,
    onValue,
    orderByValue,
    ref,
    set
} from 'firebase/database'
import { customAlphabet } from 'nanoid'

interface IOrdersManager {
    saveOrder(order: Order, receivedMerchant: Merchant): void
    getOrderByMerchant(merchant_id: string): void
    readRealTimeDB(): void
    getOrderSnapshotByMerchant(
        merchant_id: string,
        callback: (emittedData: Array<Order>) => void
    ): void
    getOrderById(id: string): Promise<Order | undefined>
    getSingleOrderSnapshot(
        order_id: string,
        callback: (emittedData: Order) => void
    ): void
}
export class OrdersManager implements IOrdersManager {
    async getOrderById(id: string): Promise<Order | undefined> {
        try {
            const docRef = doc(firebaseManager.getDB(), 'orders', id)
            const docSnap = await getDoc(docRef)
            return docSnap.data() as Order
        } catch (error) {
            new ErrorHandler(error)
        }
    }
    private dbRef = firebaseManager.getRealTimeDB()
    readRealTimeDB(): void {
        throw new Error('Method not implemented.')
    }
    async saveOrder(order: Order) {
        try {
            if (order.merchant.id) {
                await setDoc(
                    doc(firebaseManager.getDB(), 'orders', order.id),
                    order
                )
            }
        } catch (error) {
            console.error(error)
        }
    }
    async updateOrder(order: Order, status: string) {
        if (order.id) {
            try {
                const res = await await setDoc(
                    doc(firebaseManager.getDB(), 'orders', order.id),
                    { ...order, status }
                )
                return res
            } catch (error) {
                console.error(error)
            }
        } else {
            console.error('Not provided id')
        }
    }
    async getOrderByMerchant(merchant_id: string) {
        try {
            const ref = collection(firebaseManager.getDB(), 'orders')
            const q: Query = query(
                ref,
                where('merchant', '==', merchant_id),
                orderBy('issued_at', 'desc')
            )
            const querySnapshot = await getDocs(q)
            const orders: Array<Order> = []
            querySnapshot.forEach(doc => orders.push(doc.data() as Order))
            return orders
        } catch (error) {
            console.error(error)
        }
    }
    async getSingleOrderSnapshot(
        order_id: string,
        callback: (emittedData: Order) => void
    ) {
        try {
            const docRef = doc(firebaseManager.getDB(), 'orders', order_id)
            onSnapshot(docRef, doc => {
                callback(doc.data() as Order)
            })
        } catch (error) {
            console.error(error)
        }
    }
    async getOrderSnapshotByMerchant(
        merchant_id: string,
        callback: (emittedData: Array<Order>) => void
    ) {
        try {
            const ref = collection(firebaseManager.getDB(), 'orders')
            const q: Query = query(
                ref,
                where('merchant', '==', merchant_id),
                orderBy('issued_at', 'desc')
            )
            onSnapshot(q, doc => {
                const orders: Array<any> = []
                doc.forEach(doc => orders.push(doc.data()))
                callback(orders)
            })
        } catch (error) {
            console.error(error)
        }
    }
}
