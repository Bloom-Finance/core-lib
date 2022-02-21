import { slice } from 'lodash'
import moment from 'moment'
interface FormatedChain {
    type: BloomWeb3['chains']
    label: string
}
interface FormatedContractAddresses {
    chain: BloomWeb3['chains']
    addresses: Array<BloomWeb3['contractAddresses']>
}
interface IFormatter {
    formatChains(WC_CHAIN: number): FormatedChain
    formatContractAddresses(): Array<FormatedContractAddresses>
    formatCountryCurrencies(
        number: number,
        fiat_currency: 'ARS' | 'USD'
    ): string
    formatDate(date: number): string
    formatDecimal(float: number, decimalPlaces: number): number
    formatCurrency(amount: number, currencyType: string): string
    formatWalletAddress(address: string): string
    getFormatDate(): string
}

class Formatter implements IFormatter {
    /**
     *
     * @param address Wallet address to pass as an argument
     * @return Returns a formated wallet address to be shown
     */
    formatWalletAddress(address: string): string {
        const firstDigits = address.slice(0, 5)
        const lastDigitis = address.slice(-4)
        return `${firstDigits}...${lastDigitis}`
    }
    getFormatDate(): string {
        return 'DD/MM/YYYY HH:mm:ss'
    }
    /**
     *
     * @param amount Amount to format
     * @return A string with formated number
     */
    formatCurrency(amount: number, currencyType: string): string {
        const dollarUSLocale = Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyType
        })
        return dollarUSLocale.format(amount)
    }
    /**
     * @description Rounds a float number to a setted decimal places
     * @param floatNumber A float/decimal number
     * @param decimalPlaces How many decimal places you wish to be formatted
     * @return The formated number
     */
    formatDecimal(floatNumber: number, decimalPlaces: number): number {
        const p = Math.pow(10, decimalPlaces)
        return Math.round(floatNumber * p) / p
    }
    /**
     * @description Use momentjs to format a date
     * @param date The date in number format
     * @return Returns the formated date
     */
    formatDate(date: number): string {
        return moment(date).format('DD/MM/YYYY')
    }
    /**
     * @description Formats a fiat currency
     * @param number The price which you wish to be formatted
     * @param fiat_currency The type of currency, it could be ARS,USD,etc
     * @return Returns the formated currency
     */
    formatCountryCurrencies(number: number, fiat_currency: string): string {
        return `$ ${this.formatDecimal(number, 2)} ${fiat_currency}`
    }
    /**
     * @description Depending on an specific chain id it returns the type of chain and label
     * @param WC_CHAIN The walletconnect chain id
     * @return An object with type and label
     */
    formatChains(WC_CHAIN: number): FormatedChain {
        switch (WC_CHAIN) {
            case 1:
                return { type: 'eth', label: 'Ethereum' }
            case 43114:
                return { type: 'avalanche', label: 'Avalanche' }
            case 137:
                return { type: 'polygon', label: 'Polygon' }
            case 56:
                return { type: 'bsc', label: 'Binance Smart Chain' }
            case 250:
                return { type: 'fantom', label: 'Fantom' }
            default:
                return { type: 'eth', label: 'Ethereum' }
        }
    }
    /**
     * @description Internally has an array containing all contract adddreses
     * @return An Array of objects containing chain and wanted addresses
     */
    formatContractAddresses(): Array<FormatedContractAddresses> {
        return [
            {
                chain: 'eth',
                addresses: [
                    '0x6b175474e89094c44da98b954eedeac495271d0f',
                    '0xdac17f958d2ee523a2206206994597c13d831ec7',
                    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
                ]
            },
            {
                chain: 'avalanche',
                addresses: [
                    '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
                    '0xc7198437980c041c805A1EDcbA50c1Ce5db95118'
                ]
            },
            {
                chain: 'bsc',
                addresses: [
                    '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3',
                    '0x55d398326f99059ff775485246999027b3197955'
                ]
            },
            {
                chain: 'polygon',
                addresses: [
                    '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
                    '0xc2132d05d31c914a87c6611c10748aeb04b58e8f'
                ]
            },
            {
                chain: 'fantom',
                addresses: ['0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e']
            }
        ]
    }
}
export const FormatterManager = new Formatter()
