import axios, { AxiosPromise } from 'axios'
interface ISendGridResponse {
    msg: string
}
interface ISendGridService {
    sendBuyerPaymentConfirmation(
        data: EmailData
    ): AxiosPromise<ISendGridResponse>
}
class SendGridService implements ISendGridService {
    sendBuyerPaymentConfirmation(
        data: EmailData
    ): AxiosPromise<ISendGridResponse> {
        return axios.post(`${process.env.CF_API}/email`, {
            emailInformation: {
                ...data
            }
        })
    }
}
export const emailManager = new SendGridService()
