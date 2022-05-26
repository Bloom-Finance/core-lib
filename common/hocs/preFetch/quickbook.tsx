/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import Loader from '../../../../ui-lib/src/components/loader/index'
import { useEffect } from 'react'
import _ from 'lodash'
import { UIApp } from '../../../../stores/app.store'
import { quickbookService } from '../../../services/quickbook.service'
import axios from 'axios'
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
                const { data } = await axios.post(
                    'http://localhost:5001/bloom-trade/us-central1/connect_quickbook',
                    {
                        merchant
                    }
                )
                const win = window.open(
                    data,
                    'bloom',
                    'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=0,height=0,left=-1000,top=-1000'
                )
                const timer = setInterval(async () => {
                    if (win && win.closed) {
                        clearInterval(timer)
                        const { hasToken, token } =
                            await quickbookService.checkToken(
                                merchant?.id as string
                            )
                        setHasToken(hasToken)
                        setAccessToken(token?.access_token)
                    }
                }, 1000)
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
            <Component {...props} accessToken={accessToken} />
        ) : (
            <Loader />
        )
    }
    return PreFetch
}

export default withPreFetch
