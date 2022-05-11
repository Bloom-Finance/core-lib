import axios, { AxiosPromise } from 'axios'

interface IStripeManager {
    generateCheckoutURL(body: {
        currency: 'usd' | 'ars'
        unit_amount: number
        product_data: {
            name: string
        }
    }): AxiosPromise<{ url: string; msg: string }>
}
class StripeManager implements IStripeManager {
    /**
     * @description Function that generates an url with stripe checkout integration
     * @param body Data that is  necessary  to be passed in order to render the window
     */
    generateCheckoutURL(body: {
        currency: 'usd' | 'ars'
        unit_amount: number
        product_data: { name: string }
    }): AxiosPromise<{ url: string; msg: string }> {
        return axios.post('/api/checkout_sessions', body)
    }
}
export const stripeManager = new StripeManager()
