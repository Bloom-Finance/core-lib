/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import Loader from '../../../../ui-lib/src/components/loader/index'
import { useEffect } from 'react'
import _ from 'lodash'
import { UIApp } from '../../../../stores/app.store'
import { quickbookService } from '../../../services/quickbook.service'
import { quickbookLogIn } from '../../helpers/utils'
const withPreFetch = <P extends object>(Component: React.ComponentType<P>) => {
    const PreFetch = (props: any) => {
        const router = useRouter()
        const merchant = UIApp.useState(s => s.merchant)
        const [hasToken, setHasToken] = useState<boolean>(false)
        const [accessToken, setAccessToken] = useState<string>()
        const getData = async () => {
            const { hasToken, token } = await quickbookService.checkToken(
                merchant?.id as string
            )
            if (!hasToken) {
                quickbookLogIn(merchant as Merchant)
            } else {
                const { hasToken, token } = await quickbookService.checkToken(
                    merchant?.id as string
                )
                setHasToken(hasToken)
                setAccessToken(token?.access_token)
            }
        }
        useEffect(() => {
            ;(async () => {
                await getData()
            })()
        }, [])
        return hasToken && accessToken ? (
            <Component
                {...props}
                accessToken={accessToken}
                merchant={merchant}
            />
        ) : (
            <Loader />
        )
    }
    return PreFetch
}

export default withPreFetch
