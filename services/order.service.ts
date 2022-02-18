import { firebaseManager } from './firebase.services'
import { setDoc, getDoc } from '@firebase/firestore'
import { doc } from 'firebase/firestore'
import { ref } from 'firebase/storage'
import { merchantService } from './merchant.service'

interface IOrderService {
    get(id: string): Promise<Order>
}
class OrderService implements IOrderService {
    async get(id: string): Promise<Order> {
        const docRef = doc(firebaseManager.getDB(), 'orders', id)
        const docSnap = await getDoc(docRef)
        const order = docSnap.data()
        if(!order)  Promise.reject('Couldnt resolve promise')
        const merchant = await merchantService.get( order?.merchant)
        return {
            ...docSnap.data(),
            merchant
        } as Order
    }
}

export const orderService = new OrderService()
