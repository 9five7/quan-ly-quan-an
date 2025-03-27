'use client'

import { useAppContext } from '@/components/app-provider'
import { Badge } from '@/components/ui/badge'
import { OrderStatus } from '@/constants/type'
import { toast } from '@/hooks/use-toast'

import { formatCurrency, getVietnameseOrderStatus } from '@/lib/utils'
import { useGuestGetOrderListQuery } from '@/queries/useGuest'
import { PayGuestOrdersResType, UpdateOrderResType } from '@/schemaValidations/order.schema'

import Image from 'next/image'
import { useEffect, useMemo } from 'react'

export default function OrdersCart() {
  const { socket } = useAppContext()
  const { data, refetch } = useGuestGetOrderListQuery()
  const orders = useMemo(() => data?.payload.data ?? [], [data])
  const { waitingForPaying, paid } = useMemo(() => {
    return orders.reduce(
      (result, order) => {
        if (
          order.status === OrderStatus.Delivered ||
          order.status === OrderStatus.Processing ||
          order.status === OrderStatus.Pending
        ) {
          return {
            ...result,
            waitingForPaying: {
              price: result.waitingForPaying.price + order.dishSnapshot.price * order.quantity,
              quantity: result.waitingForPaying.quantity + order.quantity
            }
          }
        }
        if (order.status === OrderStatus.Paid) {
          return {
            ...result,
            paid: {
              price: result.paid.price + order.dishSnapshot.price * order.quantity,
              quantity: result.paid.quantity + order.quantity
            }
          }
        }
        return result
      },
      {
        waitingForPaying: {
          price: 0,
          quantity: 0
        },
        paid: {
          price: 0,
          quantity: 0
        }
      }
    )
  }, [orders])
  useEffect(() => {
    if (socket?.connected) {
      onConnect()
    }

    function onConnect() {}

    function onDisconnect() {}
    function onPayment(data: PayGuestOrdersResType['data']) {
      const { guest } = data[0]
      toast({
        description: `${guest?.name} tại bàn ${guest?.tableNumber} thanh toán thành công ${data.length} đơn`
      })
      refetch()
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function onUpdateOrder(data: UpdateOrderResType['data']) {
      {
        const {
          dishSnapshot: { name },
          quantity
        } = data
        toast({
          description: `Món ${name} (SL: ${quantity}) vừa được cập nhật sang trạng thái "${getVietnameseOrderStatus(
            data.status
          )}"`
        })
        refetch()
      }
    }

    socket?.on('connect', onConnect)
    socket?.on('disconnect', onDisconnect)
    socket?.on('update-order', onUpdateOrder)
    socket?.on('payment', onPayment)
    return () => {
      socket?.off('connect', onConnect)
      socket?.off('disconnect', onDisconnect)
      socket?.off('update-order', onUpdateOrder)
      socket?.off('payment', onPayment)
    }
  }, [refetch, socket])
  return (
    <>
      {orders.map((order, index) => (
        <div key={order.id} className='flex gap-4'>
          <div className='text-sm font-semibold'>{index + 1}</div>
          <div className='flex-shrink-0 relative'>
            <Image
              src={order.dishSnapshot.image}
              alt={order.dishSnapshot.name}
              width={100}
              height={100}
              quality={100}
              className='w-[100px] h-[100px] object-cover'
            />
          </div>
          <div className='space-x-1'>
            <h3 className='text-sm'>{order.dishSnapshot.name}</h3>
            <div className='text-xs font-semibold'>
              {formatCurrency(order.dishSnapshot.price)} x <Badge className='px-1'>{order.quantity}</Badge>
            </div>
          </div>
          <div className='flex-shrink-0 ml-auto flex justify-center items-center'>
            <Badge variant={'outline'}>{getVietnameseOrderStatus(order.status)}</Badge>
          </div>
        </div>
      ))}
      <div className='flex flex-col sticky space-x-4 bg-white shadow p-3'>
      {paid.quantity !== 0 && (
        <div className='bottom-0 '>
          <div className='w-full flex space-x-4 text-xl font-semibold'>
            <span>Đơn đã thanh toán · {paid.quantity} món</span>
            <span>{formatCurrency(paid.price)}</span>
          </div>
        </div>
      )}
      <div className='bottom-0 '>
        <div className='w-full flex space-x-4 text-xl font-semibold'>
        <span>Đơn chưa thanh toán · {waitingForPaying.quantity} món</span>
          <span>{formatCurrency(waitingForPaying.price)}</span>
        </div> 
      </div>
      </div>
      
      {/* <div className='sticky bottom-0 flex flex-col space-x-4 bg-white shadow p-3'>
        {paid.quantity !== 0 && (
          <div className='w-full flex  text-xl font-semibold'>
            <span>Đơn đã thanh toán · {paid.quantity} món : </span>
            <span>{formatCurrency(paid.price)}</span>
          </div>
        )}

        {waitingForPaying.quantity !== 0 && (
          <div className='w-full flex  text-xl font-semibold'>
            <span>Đơn chưa thanh toán · {waitingForPaying.quantity} món :  </span>
            <span>{formatCurrency(waitingForPaying.price)}</span>
          </div>
        )}
      </div> */}
    </>
  )
}
