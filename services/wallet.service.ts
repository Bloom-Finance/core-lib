/* eslint-disable @typescript-eslint/ban-types */
import { FormatterManager } from '../common/helpers/formatter'
import { removeToken } from './auth.service'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Moralis from 'moralis'
import _ from 'lodash'
import moment from 'moment'

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

    /**
     * Returns the wallet address of current user
     * @returns the address
     */
    getAddressCurrentUser(): string {
        return Moralis.User.current()?.attributes.ethAddress
    }

    /**
     * @returns URL Icon wallet or null
     */
    getWalletIcon(): string {
        const firstElement = _.head(
            this.activeProvider.provider?.walletMeta?.icons
        )
        return firstElement as string
    }

    async getTokenPrice(token_address: string) {
        Moralis.Web3API.native.getDateToBlock({
            date: moment(new Date()).subtract(3, 'minute').toString()
        })
        const result = await Moralis.Web3API.token.getTokenPrice({
            address: token_address,
            chain: 'eth'
        })

        return {
            price: result.usdPrice
        }
    }

    async getBalances() {
        const balances: any = await Moralis.Web3API.account.getTokenBalances({
            chain: 'ropsten',
            address: this.getAddressCurrentUser()
        })

        const native = await Moralis.Web3API.account.getNativeBalance({
            chain: 'ropsten',
            address: this.getAddressCurrentUser()
        })

        for (const i in balances) {
            const price = await this.getTokenPrice(balances[i].token_address)
            balances[i] = {
                ...balances[i],
                price
            }
        }
        balances.push({
            balance: native.balance,
            decimals: '18',
            name: 'Ethereum',
            symbol: 'ETH',
            token_address: '0x42F6f551ae042cBe50C739158b4f0CAC0Edb9096'
        })
        return balances
    }
}
