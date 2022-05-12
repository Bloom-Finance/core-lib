/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import Loader from '../../../../ui-lib/src/components/loader/index'
import { ErrorHandler } from '../../helpers/errorHandler'
import { useEffect } from 'react'
import _ from 'lodash'
import { stripeManager } from '../../../services/stripe.service'
import Stripe from 'stripe'
const withPreFetch = <P extends object>(Component: React.ComponentType<P>) => {
    const PreFetch = (props: any) => {
        const router = useRouter()
        const { session_id } = router.query
        const [paymentInformation, setPaymentInformation] =
            useState<Stripe.Checkout.Session>()
        const getData = async () => {
            try {
                const { data } = await stripeManager.getTransactionSession(
                    session_id
                )
                setPaymentInformation(data.session)
            } catch (error) {
                console.log(error)
            }
        }
        useEffect(() => {
            ;(async () => {
                if (session_id) await getData()
            })()
        }, [session_id])
        return session_id && paymentInformation ? (
            <Component {...props} payment={paymentInformation} />
        ) : (
            <Loader />
        )
    }
    return PreFetch
}

export default withPreFetch
