import axios, { AxiosPromise } from 'axios'
import Stripe from 'stripe'

interface IStripeResponse {
    url?: string
    msg?: string
    session?: Stripe.Checkout.Session
}

interface IStripeManager {
    generateCheckoutURL(body: {
        currency: 'usd' | 'ars'
        unit_amount: number
        product_data: {
            name: string
        }
    }): AxiosPromise<IStripeResponse>
    getTransactionSession(
        session_id: string | undefined | string[]
    ): AxiosPromise<IStripeResponse>
}
class StripeManager implements IStripeManager {
    /**
     * @description Gets the data of the transaction
     * @param session_id The id of the session
     */
    getTransactionSession(
        session_id: string | undefined | string[]
    ): AxiosPromise<IStripeResponse> {
        return axios.get(` /api/checkout_sessions?session_id=${session_id}`)
    }
    /**
     * @description Function that generates an url with stripe checkout integration
     * @param body Data that is  necessary  to be passed in order to render the window
     */
    generateCheckoutURL(body: {
        currency: 'usd' | 'ars'
        unit_amount: number
        product_data: { name: string }
        order_id: string
        api_key: string
    }): AxiosPromise<{ url: string; msg: string }> {
        return axios.post('/api/checkout_sessions', body)
    }
}
export const stripeManager = new StripeManager()
