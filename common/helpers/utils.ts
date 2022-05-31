/* eslint-disable import/no-anonymous-default-export */
import axios from 'axios'
import { firebaseManager } from '../../services/firebase.services'

const quickbookLogIn = async (merchant: Merchant) => {
    const { data } = await firebaseManager.callFunction('quickbookConnect', {
        merchant
    })
    document.location.href = data as string
}

export { quickbookLogIn }
