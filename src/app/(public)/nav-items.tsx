'use client'

import { useAppContext } from '@/components/app-provider'
import Link from 'next/link'

const menuItems = [
  {
    title: 'Món ăn',
    href: '/menu' // authRequired =undefined thì đăng nhập hay chưa đều hiện thị
  },
  {
    title: 'Đơn hàng',
    href: '/orders',
    authRequired: true
  },
  {
    title: 'Đăng nhập',
    href: '/login',
    authRequired: false // authRequired =false thì chưa đăng nhập thì sẽ hiện thị
  },
  {
    title: 'Quản lý',
    href: '/manage/dashboard',
    authRequired: true // authRequired =true thì đăng nhập rồi thì sẽ hiện thị
  }
]

export default function NavItems({ className }: { className?: string }) {
  const { isAuth } = useAppContext()
  return menuItems.map((item) => {
    if ((item.authRequired === false && isAuth) || (item.authRequired === true && !isAuth)) return null
    return (
      <Link href={item.href} key={item.href} className={className}>
        {item.title}
      </Link>
    )
  })
}
