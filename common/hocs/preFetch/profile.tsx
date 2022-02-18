import { useRouter } from 'next/router'
import React, { useState } from 'react'
import Loader from '../../../../ui-lib/src/components/loader/index'
import { OrdersManager } from '../../../../services/order.service'
import { Merchant, Order, User } from '../../../../type'
import { ErrorHandler } from '../../helpers/errorHandler'
import { useEffect } from 'react'
import _ from 'lodash'
import { getToken, tokenDecode } from '../../../services/auth.service'
import { MerchantManager } from '../../../../services/merchant.service'
import MerchantStore from '../../../../store/merchant.store'
import StateStore from '../../../../store/state.store'
const withPreFetchProfile = <P extends object>(
    Component: React.ComponentType<P>
) => {
    const PreFetch = (props: any) => {
        const router = useRouter()
        const { id } = router.query
        const [merchant, setMerchant] = useState<Merchant>()
        const merchantManager = new MerchantManager()
        const merchantData = MerchantStore.useState(s => s)
        const getData = async () => {
            const sessionToken = getToken()
            const decodedToken = tokenDecode(sessionToken)
            decodedToken.merchants?.forEach(k => {
                if (k.merchant !== id || k.role !== 'ADMIN') {
                    router.back()
                }
            })
            try {
                const receivedMerchant = await merchantManager.get(id as string)
                if (!receivedMerchant) {
                    router.push('/dashboard')
                    return
                }
                setMerchant(receivedMerchant)
                MerchantStore.update(merchantState => {
                    merchantState.company = receivedMerchant.company
                    merchantState.bussiness_currency =
                        receivedMerchant.bussiness_currency
                    merchantState.id = receivedMerchant.id
                    merchantState.withdrawalAddress =
                        receivedMerchant.withdrawalAddress
                    merchantState.company_logo = receivedMerchant.company_logo
                    StateStore.update(s => {
                        s.loading = false
                    })
                })
            } catch (error) {
                new ErrorHandler(error)
            }
        }
        useEffect(() => {
            ;(async () => {
                if (id) await getData()
            })()
        }, [id])
        return id && merchant ? (
            <Component {...props} merchant={merchant} />
        ) : (
            <Loader />
        )
    }
    return PreFetch
}

export default withPreFetchProfile
