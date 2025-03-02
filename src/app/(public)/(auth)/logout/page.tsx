"use client"
import { useAppContext } from '@/components/app-provider'
import { getAccessTokenFormLocalStorage, getRefreshTokenFormLocalStorage } from '@/lib/utils'
import { useLogoutMutation } from '@/queries/useAccount'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function LogoutPage() {
  const { mutateAsync } = useLogoutMutation()
  const router = useRouter()
  const { setIsAuth } = useAppContext()
  const searchParams = useSearchParams()
  const refreshTokenFromUrl = searchParams.get('refreshToken')
  const accessTokenFromUrl = searchParams.get('accssToken')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null)
  useEffect(() => {
    // nếu chưa đăng nhập thì không cho vào trang quản lý
    if (
      !ref.current &&
      ((refreshTokenFromUrl && refreshTokenFromUrl === getRefreshTokenFormLocalStorage()) ||
        (accessTokenFromUrl && accessTokenFromUrl === getAccessTokenFormLocalStorage()))
    ) {
      ref.current = mutateAsync
      mutateAsync().then(() => {
        setTimeout(() => {
          ref.current = null
        }, 1000)
        setIsAuth(false)
        router.push('/login')
      })
    } else {
      router.push('/')
    }
    // check refrshtoken có giống trong localStorage không
  }, [mutateAsync, router, refreshTokenFromUrl, accessTokenFromUrl, setIsAuth])
  return <div>Logout...</div>
}
