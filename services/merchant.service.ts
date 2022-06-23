import { FirebaseManager, firebaseManager } from './firebase.services'
import { getDoc } from '@firebase/firestore'
import { doc, updateDoc } from 'firebase/firestore'
import { HttpsCallableResult } from 'firebase/functions'

const COLLECTION = 'merchant'

interface IMerchantService {
    get(id: string): Promise<Merchant>
    createInvite(
        merchant: string,
        createdBy: string
    ): Promise<
        HttpsCallableResult<{
            inviteId: string
        }>
    >
    craftInviteLink(inviteUrl: string): string
    addNewEmployee(
        merchant: string,
        user_id: string,
        role: string
    ): Promise<void>
}

class MerchantService implements IMerchantService {
    private db

    constructor(fm: FirebaseManager) {
        this.db = fm.getDB()
    }
    /**
     * It takes an inviteId as a string and returns a string that is the hostname of the current page
     * with the inviteId appended to the end
     * @param {string} inviteId - The invite ID that you want to generate a link for.
     * @returns The hostname of the current page, followed by a query string with the inviteId.
     */
    craftInviteLink(inviteId: string): string {
        return `${location.host}/invite/${inviteId}`
    }
    /**
     * It creates an invite to a merchant
     * @param {string} merchant - The merchant ID of the merchant you want to create an invite for.
     * @param {string} createdBy - The user id of the user who created the invite.
     * @returns A promise that resolves to an object with a single property, inviteId.
     */
    createInvite(
        merchant: string,
        createdBy: string
    ): Promise<
        HttpsCallableResult<{
            inviteId: string
        }>
    > {
        return firebaseManager.callFunction<{
            inviteId: string
        }>('createInvite', {
            merchant,
            createdBy
        })
    }
    async get(id: string): Promise<Merchant> {
        const docRef = doc(firebaseManager.getDB(), COLLECTION, id)
        const docSnap = await getDoc(docRef)
        return docSnap.data() as Merchant
    }
    async addNewEmployee(
        merchant: string,
        user_id: string,
        role: string
    ): Promise<void> {
        const docRef = doc(firebaseManager.getDB(), COLLECTION, merchant)
        const merchantDB = (await (await getDoc(docRef)).data()) as Merchant
        merchantDB.employees.push({
            role: role,
            user_id: user_id
        })
        await updateDoc(docRef, {
            employees: merchantDB.employees
        })
    }
}

export const merchantService = new MerchantService(firebaseManager)
