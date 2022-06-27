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
        if (process.env.RUNTIME === 'DEV')
            return {
                type: 'goerli',
                label: 'Goerli'
            }

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

    async getTokenPrice(symbol: string) {
        if (symbol === 'ETH') return 1900

        if (symbol === 'USDT') return 0.96

        /* const block = await Moralis.Web3API.native.getDateToBlock({
            date: moment(new Date()).subtract(3, 'minute').toString()
        })

        const result = await Moralis.Web3API.token.getTokenPrice({
            address: token_address,
            chain: 'eth'
        })

        console.log(result)
        return {
            price: result.usdPrice
        }*/
    }

    async transferEth(amount: string, token: string) {
        const options = {
            type: 'native',
            amount: Moralis.Units.ETH('0.01'),
            receiver: '0x63E05a925441e807444C1a357c4F8569285AdCB9'
        }
        const moralisHandler = Moralis as any
        const result = await moralisHandler.transfer(options)

        return result
    }

    async transferToken(amount: string, token: any) {
        const options = {
            type: 'native',
            amount: Moralis.Units.Token(amount, token.decimals),
            receiver: '0x63E05a925441e807444C1a357c4F8569285AdCB9'
        }

        const moralisHandler = Moralis as any
        const result = await moralisHandler.transfer(options)

        return result
    }

    async getBalances() {
        const balances: any = await Moralis.Web3API.account.getTokenBalances({
            chain: this.getCurrentChainId().type as any,
            address: this.getAddressCurrentUser()
        })

        const native = await Moralis.Web3API.account.getNativeBalance({
            chain: this.getCurrentChainId().type as any,
            address: this.getAddressCurrentUser()
        })

        balances.push({
            balance: native.balance,
            decimals: '18',
            name: 'Ethereum',
            symbol: 'ETH',
            token_address: '0x42F6f551ae042cBe50C739158b4f0CAC0Edb9096'
        })

        for (const i in balances) {
            //const price = await this.getTokenPrice(balances[i].symbol)

            balances[i] = {
                ...balances[i],
                id: balances[i].name.split(' ')[0].toLowerCase()
            }
        }

        return balances
    }

    rankTransactions(balances: Array<any>) {
        const list = []
        for (const i in balances) {
            let element = balances[i]
            if (balances[i].symbol === 'USDT') {
                element = {
                    ...element,
                    kind_of_transaction: 'FASTER'
                }
            }
            if (balances[i].symbol === 'ETH') {
                element = {
                    ...element,
                    kind_of_transaction: 'EXPENSIVE'
                }
            }

            list.push(element)
        }

        return list
    }
}
