'use client'
import Quantity from '@/app/guest/menu/quantity'
import { Button } from '@/components/ui/button'
import { DishStatus } from '@/constants/type'
import { cn, formatCurrency, handleErrorApi } from '@/lib/utils'
import { useDishListQuery } from '@/queries/useDish'
import { useGuestOrderMutation } from '@/queries/useGuest'
import { GuestCreateOrdersBodyType } from '@/schemaValidations/guest.schema'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

export default function MenuOrders() {
  const { data } = useDishListQuery()
  const dishes = useMemo(() => data?.payload.data ?? [], [data])
  const [orders, setOrders] = useState<GuestCreateOrdersBodyType>([])
  const { mutateAsync } = useGuestOrderMutation()
  const router = useRouter()
  const totalPrice = useMemo(() => {
    return dishes.reduce((result, dish) => {
      const order = orders.find((order) => order.dishId === dish.id)
      // duyệt qua mảng orders tìm phần tử đầu tiên thỏa mãn điều kiện order.dishId === dish.id.
      if (!order) return result // nếu ko tìm thấy phần tử trên mảng orders thi return result mặc dịnh là 0
      return result + order.quantity * dish.price // nếu thấy thì return về
    }, 0)
  }, [dishes, orders])
  const totalDish = useMemo(() => {
    return orders.reduce((total, order) => total + order.quantity, 0)
  }, [orders])
  const handleChange = (dishId: number, quantity: number) => {
    setOrders((prevOrders) => {
      if (quantity === 0) {
        return prevOrders.filter((order) => order.dishId !== dishId) //lọc phần tử thỏa mản điều kiện order.dishId !== dishId
      }
      const index = prevOrders.findIndex((order) => order.dishId === dishId) // lọc phần tử thỏa mản điều kiện order.dishId === dishId
      if (index === -1) {
        return [...prevOrders, { dishId, quantity }]
      }
      const newOrders = [...prevOrders]
      newOrders[index] = { ...newOrders[index], quantity }
      return newOrders
    })
  }
  const handleOrder = async () => {
    try {
      await mutateAsync(orders)
      console.log(orders)
      router.push(`/guest/orders`)
    } catch (error) {
      handleErrorApi({
        error
      })
    }
  }
  return (
    <>
      {dishes
        .filter((dish) => dish.status !== DishStatus.Hidden)
        .map((dish) => (
          <div
            key={dish.id}
            className={cn('flex gap-4', {
              'pointer-events-none': dish.status === DishStatus.Unavailable
            })} //pointer-events-none thuộc tính css giup khóa event
          >
            <div className='flex-shrink-0 relative'>
              {dish.status === DishStatus.Unavailable && (
                <span className='absolute flex inset-0 items-center justify-center text-white bg-black/50 z-0'>
                  Hết hàng
                </span>
              )}
              <Image
                src={dish.image}
                alt={dish.name}
                height={100}
                width={100}
                quality={100}
                className='object-cover w-[80px] h-[80px] rounded-md'
              />
            </div>
            <div className='space-y-1'>
              <h3 className='text-sm'>{dish.name}</h3>
              <p className='text-xs'>{dish.description}</p>
              <p className='text-xs font-semibold'>{formatCurrency(dish.price)}</p>
            </div>
            <div className='flex-shrink-0 ml-auto flex justify-center items-center'>
              <Quantity
                onChange={(value) => handleChange(dish.id, value)}
                value={orders.find((order) => order.dishId === dish.id)?.quantity ?? 0}
              />
            </div>
          </div>
        ))}
      <div className='sticky bottom-0'>
        <Button onClick={handleOrder} disabled={orders.length === 0} className='w-full justify-between'>
          <span>
            Gọi Món · {orders.length} món - SL:({totalDish}) :
          </span>
          <span>{formatCurrency(totalPrice)}</span>
        </Button>
      </div>
    </>
  )
}
