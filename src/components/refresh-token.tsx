'use client'

import { useAppContext } from '@/components/app-provider'
import { checkAndRefreshToken } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

const UNAUTHENTIACATED_PATHS = ['/login', '/register', '/refresh-token']
export default function RefreshToken() {
  const pathname = usePathname()
  const router = useRouter()
  const { socket, disconnectSocket } = useAppContext()
  useEffect(() => {
    if (UNAUTHENTIACATED_PATHS.includes(pathname)) return // check xem path có trong mảng không
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let interval: any = null
    const onRefreshToken = (force: boolean) => {
      checkAndRefreshToken({
        onError: () => {
          clearInterval(interval)
          disconnectSocket()
          router.push('/login')
        },
        force
      })
    }
    // phải chạy checkAndRefreshToken 1 lần khi mới vào trang

    const TIMEOUT = 1000
    interval = setInterval(onRefreshToken, TIMEOUT)
    if (socket?.connected) {
      onConnect()
    }

    function onConnect() {}

    function onDisconnect() {}
    function onRefreshTokenSocket() {
      onRefreshToken(true)
    }
    socket?.on('connect', onConnect)
    socket?.on('disconnect', onDisconnect)
    socket?.on('refresh-token', onRefreshTokenSocket)
    return () => {
      clearInterval(interval)
      socket?.off('connect', onConnect)
      socket?.off('disconnect', onDisconnect)
      socket?.off('refresh-token', onRefreshTokenSocket)
    }
  }, [pathname, router,socket,disconnectSocket])
  return null
}
