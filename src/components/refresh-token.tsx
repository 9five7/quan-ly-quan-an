/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { checkAndRefreshToken } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

const UNAUTHENTIACATED_PATHS = ['/login', '/register', '/refresh-token']
export default function RefreshToken() {
  const pathname = usePathname()
  const router = useRouter()
  useEffect(() => {
    if (UNAUTHENTIACATED_PATHS.includes(pathname)) return // check xem path có trong mảng không
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let interval: any = null

    // phải chạy checkAndRefreshToken 1 lần khi mới vào trang
    checkAndRefreshToken({
      onError: () => {
        clearInterval(interval)
        router.push('/login')
      }
    })
    const TIMEOUT = 1000
    interval = setInterval(
      () =>
        checkAndRefreshToken({
          onError: () => {
            clearInterval(interval)
            router.push('/login')
          }
        }),
      TIMEOUT
    )
    return () => clearInterval(interval)
  }, [pathname, router])
  return null
}
