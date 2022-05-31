import { useRouter } from 'next/router'
import React, { useState } from 'react'
import Loader from '../../../../ui-lib/src/components/loader/index'

import { ErrorHandler } from '../../helpers/errorHandler'
import { useEffect } from 'react'
import _ from 'lodash'
import { orderService } from '../../../services/order.service'
const withPreFetch = <P extends object>(Component: any) => {
    const PreFetch = (props: any) => {
        const router = useRouter()
        const { id } = router.query
        const [order, setOrder] = useState<Order>()

        const getData = async () => {
            try {
                const order = await orderService.getOrder(id as string)
                if (_.isEmpty(order)) router.push('/dashboard')
                if (order) setOrder(order)
            } catch (error) {
                new ErrorHandler(error)
            }
        }
        useEffect(() => {
            ;(async () => {
                if (id) await getData()
            })()
        }, [id])
        return id && order ? <Component {...props} order={order} /> : <Loader />
    }
    return PreFetch
}

export default withPreFetch
