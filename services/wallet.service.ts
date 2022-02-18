/* eslint-disable @typescript-eslint/ban-types */
import { FormatterManager } from '../common/helpers/formatter'
import { removeToken } from './auth.service'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Moralis from 'moralis'
interface activeProvider {
    provider?: WalletConnectProvider
}
export class WalletManager {
    public activeProvider: activeProvider
    public connected: boolean
    constructor() {
        this.activeProvider = Moralis.Web3.activeWeb3Provider as activeProvider
        if (this.activeProvider) {
            this.connected = this.activeProvider.provider?.connected as boolean
        } else {
            this.connected = false
            //TODO Properly detect when disconnecting page
            //console.error('provider not detected')
        }
    }
    /**
     * @description Event to disconnection from wc
     * @param moralisHook Provide the respective hook to signout from the react-moralis library
     */
    onDisconnect(isAuth: boolean, logout: Function) {
        this.activeProvider.provider?.wc.on('disconnect', (error, payload) => {
            if (error) {
                throw error
            }
            if (isAuth) {
                const isBrowser = () => typeof window !== 'undefined'
                logout()
                removeToken()
                if (isBrowser()) {
                    window.location.reload()
                }
            }
        })
    }
    /**
     * @description After detecting disconnection from wc,
     * this function wipes out data from local storage
     * @param moralisHook Provide the respective hook to signout from the react-moralis library
     */
    async LogOut(moralisHook: Function) {
        removeToken()
        Moralis.Web3.cleanup().then(() => moralisHook())
    }
    /**
     * @description Function that receivs a chain from the WC connection and returns it formatted
     */
    getCurrentChainId() {
        return FormatterManager.formatChains(
            this.activeProvider.provider?.chainId as number
        )
    }
}
