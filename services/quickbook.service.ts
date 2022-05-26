import axios, { AxiosPromise } from 'axios'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { firebaseManager } from './firebase.services'

interface IQuickbookService {
    exchangeTokens(data: {
        redirect_uri: string
        code: string
        merchant: Merchant
    }): AxiosPromise<{
        x_refresh_token: number
        refresh_token: string
        access_token: string
        token_type: string
        expires_in: number
    }>
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
    ): AxiosPromise<{
        x_refresh_token: number
        refresh_token: string
        access_token: string
        token_type: string
        expires_in: number
    }>
}

class QuickBookService implements IQuickbookService {
    retrieveAccessToken(
        refresh_token: string,
        merchant: Merchant
    ): AxiosPromise<{
        x_refresh_token: number
        refresh_token: string
        access_token: string
        token_type: string
        expires_in: number
    }> {
        return axios.post(`${process.env.CF_API}/quickbook_refresh`, {
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
            return {
                hasToken: true,
                token: {
                    refresh_token: data.refresh_token,
                    access_token: data.access_token,
                    expires_in: data.expires_in
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
    }): AxiosPromise<{
        x_refresh_token: number
        refresh_token: string
        access_token: string
        token_type: string
        expires_in: number
    }> {
        return axios.post(`${process.env.CF_API}/quickbook_callback`, data)
    }
}

export const quickbookService = new QuickBookService()
