import { FirebaseManager, firebaseManager } from './firebase.services'
import { getDoc } from '@firebase/firestore'
import { collection, doc, updateDoc, where, query } from 'firebase/firestore'
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
    getEmployeeByMerchant(
        user_id: string,
        merchantId: string
    ): Promise<User | undefined>
    updateInvite(invite_id: string): Promise<void>
}

class MerchantService implements IMerchantService {
    private db
    constructor(fm: FirebaseManager) {
        this.db = fm.getDB()
    }
    async updateInvite(invite_id: string): Promise<void> {
        const docRef = doc(firebaseManager.getDB(), 'invites', invite_id)
        await updateDoc(docRef, {
            used: true
        })
    }
    /**
     * It gets the merchant document from the database, then it gets the user document from the
     * database, then it returns the user document
     * @param {string} user_id - The user id of the employee you want to get
     * @param {string} merchantId - The id of the merchant
     * @returns a promise that resolves to a User or undefined.
     */
    async getEmployeeByMerchant(
        user_id: string,
        merchantId: string
    ): Promise<User | undefined> {
        const docRef = doc(firebaseManager.getDB(), COLLECTION, merchantId)
        const merchantDB = (await (await getDoc(docRef)).data()) as Merchant
        const employee = merchantDB.employees.find(
            employee => employee.user_id === user_id
        )
        if (!employee) {
            return
        } else {
            const docRefUser = doc(
                firebaseManager.getDB(),
                'users',
                employee.user_id
            )
            const userDB = (await (await getDoc(docRefUser)).data()) as User
            return userDB
        }
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
        const docRef = doc(this.db, COLLECTION, id.toString())
        const docSnap = await getDoc(docRef)
        const merchant = docSnap.data()
        return merchant as Merchant
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
