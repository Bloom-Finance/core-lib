import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { HttpsCallableResult } from 'firebase/functions'
import { firebaseManager } from './firebase.services'
interface IQuickbookService {
    updateQuickbooksConnection(
        connected: boolean,
        merchant: Merchant
    ): Promise<void>
    exchangeTokens(data: {
        redirect_uri: string
        code: string
        merchant: Merchant
    }): Promise<
        HttpsCallableResult<{
            x_refresh_token: number
            refresh_token: string
            access_token: string
            token_type: string
            expires_in: number
        }>
    >
    saveTokens(
        refresh_token: string,
        merchant_id: string
    ): Promise<{ msg: string; status: number }>
    checkToken(merchant_id: string): Promise<{
        hasToken: boolean
        token?: {
            access_token: string
            refresh_token: string
            expires_in: number
        }
    }>
    retrieveAccessToken(
        refresh_token: string,
        merchant: Merchant
    ): Promise<
        HttpsCallableResult<{
            x_refresh_token: number
            refresh_token: string
            access_token: string
            token_type: string
            expires_in: number
            hasToRefresh: boolean
        }>
    >
    getCustomers(
        accessToken: string,
        realmId: string
    ): Promise<HttpsCallableResult<any>>
    getItems(
        accessToken: string,
        realmId: string
    ): Promise<HttpsCallableResult<any>>
}
class QuickBookService implements IQuickbookService {
    /**
     * It updates the `quickbook` property of the `merchant` document in the `merchant` collection
     * @param {boolean} connected - boolean - This is a boolean value that indicates whether the
     * merchant is connected to Quickbooks or not.
     * @param {Merchant} merchant - Merchant - this is the merchant object that is passed in from the
     * component.
     */
    async updateQuickbooksConnection(
        connected: boolean,
        merchant: Merchant
    ): Promise<void> {
        const docRef = await doc(
            firebaseManager.getDB(),
            'merchant',
            merchant.id as string
        )
        await updateDoc(docRef, {
            quickbook: {
                ...merchant.quickbook,
                connected
            }
        })
    }
    /**
     * It calls the cloud function quickbookGetCustomers with the parameters accessToken and realmId.
     * @param {string} accessToken - The access token that you got from the QuickBooks API.
     * @param {string} realmId - The realmId is the unique identifier for your company. You can find
     * this in the URL when you are logged into QuickBooks.
     * @returns The return value is a Promise that resolves to an object of type HttpsCallableResult.
     */
    getItems(
        accessToken: string,
        realmId: string
    ): Promise<HttpsCallableResult<any>> {
        return firebaseManager.callFunction('quickbookGetItems', {
            accessToken,
            realmId
        })
    }
    /**
     * It calls the cloud function quickbookGetCustomer with the parameters accessToken and realmId.
     * @param {string} accessToken - The access token that you got from the OAuth flow.
     * @param {string} realmId - The realmId is the unique identifier for your company. You can find
     * this in the URL when you are logged into QuickBooks.
     * @returns The return value is a promise that resolves to an object of type HttpsCallableResult.
     */
    getCustomers(
        accessToken: string,
        realmId: string
    ): Promise<HttpsCallableResult<any>> {
        return firebaseManager.callFunction('quickbookGetCustomers', {
            accessToken,
            realmId
        })
    }
    /**
     * @description Gets the access token from a refr
    getCustomers(): Promise<HttpsCallableResult<any>> {
        throw new Error('Method not implemented.')
    }esh token
     * @param refresh_token The refresh token needed
     * @param merchant The owner of the refresh_token
     * @return An object with all the tokens
     */
    async retrieveAccessToken(
        refresh_token: string,
        merchant: Merchant
    ): Promise<
        HttpsCallableResult<{
            x_refresh_token: number
            refresh_token: string
            access_token: string
            token_type: string
            expires_in: number
            hasToRefresh: boolean
        }>
    > {
        return firebaseManager.callFunction<{
            x_refresh_token: number
            refresh_token: string
            access_token: string
            token_type: string
            expires_in: number
            hasToRefresh: boolean
        }>('quickbookRefresh', {
            refresh_token,
            merchant,
            grant_type: 'refresh_token'
        })
    }
    /**
     * @description Checks if a merchant have a refresh_token
     * @param merchant_id Merchant id identifier
     * @return An object with a boolean checking if  has token
     */
    async checkToken(merchant_id: string): Promise<{
        hasToken: boolean
        token?: {
            access_token: string
            refresh_token: string
            expires_in: number
        }
    }> {
        const docRef = await doc(
            firebaseManager.getDB(),
            'merchant',
            merchant_id as string
        )
        const docSnap = await getDoc(docRef)
        const merchant = (await docSnap.data()) as Merchant
        if (merchant.quickbook.refresh_token.length !== 0) {
            const { data } = await this.retrieveAccessToken(
                merchant.quickbook.refresh_token,
                merchant
            )
            if (data.hasToRefresh) {
                return {
                    hasToken: false
                }
            } else {
                return {
                    hasToken: true,
                    token: {
                        refresh_token: data.refresh_token,
                        access_token: data.access_token,
                        expires_in: data.expires_in
                    }
                }
            }
        } else {
            return {
                hasToken: false
            }
        }
    }
    /**
     * @description Saves a corresponding token to a merchant
     * @param refresh_token Token to be passed
     * @param merchant_id The merchant identifier
     */
    async saveTokens(
        refresh_token: string,
        merchant_id: string
    ): Promise<{ msg: string; status: number }> {
        try {
            const docRef = await doc(
                firebaseManager.getDB(),
                'merchant',
                merchant_id
            )
            const docSnap = await getDoc(docRef)
            const merchant = (await docSnap.data()) as Merchant
            await updateDoc(docRef, {
                quickbook: {
                    refresh_token,
                    realmId: merchant.quickbook.realmId,
                    credentials: {
                        client_id: merchant.quickbook.credentials.client_id,
                        client_secret:
                            merchant.quickbook.credentials.client_secret
                    }
                }
            })
            return {
                msg: 'Succesfully updated refresh token',
                status: 200
            }
        } catch (error) {
            return {
                msg: 'Oops! Something went wrong',
                status: 400
            }
        }
    }
    /**
     * @description Exhanges a given data for a token in intuit servers
     * @param data Data that is  necessary  to be passed in order to exchange the tokens
     */
    exchangeTokens(data: {
        redirect_uri: string
        code: string
        merchant: Merchant
    }): Promise<
        HttpsCallableResult<{
            x_refresh_token: number
            refresh_token: string
            access_token: string
            token_type: string
            expires_in: number
        }>
    > {
        return firebaseManager.callFunction<{
            x_refresh_token: number
            refresh_token: string
            access_token: string
            token_type: string
            expires_in: number
        }>('quickbookCallback', data)
    }
}

export const quickbookService = new QuickBookService()
