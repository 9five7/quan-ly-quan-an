'use client'

import authApiRequest from '@/apiRequests/auth'
import { useAppContext } from '@/components/app-provider'
import { Role } from '@/constants/type'
import { cn, handleErrorApi } from '@/lib/utils'
import { RoleType } from '@/types/jwt.types'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const menuItems: {
  title: string
  href: string
  hideWhenLogin?: boolean
  role?: RoleType[]
}[] = [
  {
    title: 'Trang chủ',
    href: '/' // authRequired =undefined thì đăng nhập hay chưa đều hiện thị
  },
  {
    title: 'Menu',
    href: '/guest/menu',
    role: [Role.Guest]
  },
  {
    title: 'Đơn hàng',
    href: '/guest/orders',  
    role: [Role.Guest]
  },
  {
    title: 'Đăng nhập',
    href: '/login',
    hideWhenLogin: true
  },
  {
    title: 'Quản lý',
    href: '/manage/dashboard',
    role: [Role.Owner, Role.Employee]
  }
]

export default function NavItems({ className }: { className?: string }) {
  const { role, setRole } = useAppContext()
  const logoutMutation = useMutation({
    mutationFn: authApiRequest.logout
  })
  const router = useRouter()
  const logout = async () => {
    if (logoutMutation.isPending) return
    try {
      await logoutMutation.mutateAsync()
      setRole()
      router.push('/')
    } catch (error) {
      handleErrorApi({ error })
    }
  }
  return (
    <>
      {menuItems.map((item) => {
        // trường hợp đăng nhập thì hiện thị item  menu dangw nhâp
        const isAuth = item.role && role && item.role.includes(role)
        //trường hợp menu item  có thể hiện thị dù chưa đăng nhập hay không
        const canShow = (item.role === undefined && !item.hideWhenLogin) || (!role && item.hideWhenLogin)
        if (isAuth || canShow) {
          return (
            <Link href={item.href} key={item.href} className={className}>
              {item.title}
            </Link>
          )
        }
        return null
      })}
      {role && (
        <div className={cn(className, 'cursor-pointer')} onClick={logout}>
          Đăng xuất
        </div>
      )}
    </>
  )
}
