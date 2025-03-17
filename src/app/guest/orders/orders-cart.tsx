'use client'

import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import socket from '@/lib/socket'
import { formatCurrency, getVietnameseOrderStatus } from '@/lib/utils'
import { useGuestGetOrderListQuery } from '@/queries/useGuest'
import { UpdateOrderResType } from '@/schemaValidations/order.schema'

import Image from 'next/image'
import { useEffect, useMemo } from 'react'

export default function OrdersCart() {
  const { data, refetch } = useGuestGetOrderListQuery()
  const orders = useMemo(() => data?.payload.data ?? [], [data])
  const totalPrice = useMemo(() => {
    return orders.reduce((result, order) => {
      return result + order.quantity * order.dishSnapshot.price
    }, 0)
  }, [orders])
  useEffect(() => {
    if (socket.connected) {
      onConnect()
    }

    function onConnect() {}

    function onDisconnect() {}
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

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('update-order', onUpdateOrder)
    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('update-order', onUpdateOrder)
    }
  }, [refetch])
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
      <div className='sticky bottom-0 '>
        <div className='w-full flex space-x-4 text-xl font-semibold'>
          <span>Tổng cộng · {orders.length} món</span>
          <span>{formatCurrency(totalPrice)}</span>
        </div>
      </div>
    </>
  )
}
