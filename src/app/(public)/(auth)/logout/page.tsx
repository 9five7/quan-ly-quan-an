import { getAccessTokenFormLocalStorage, getRefreshTokenFormLocalStorage } from '@/lib/utils'
import { useLogoutMutation } from '@/queries/useAccount'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function LogoutPage() {
  const { mutateAsync } = useLogoutMutation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const refreshTokenFromUrl = searchParams.get('refreshToken')
  const accessTokenFromUrl = searchParams.get('accssToken')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null)
  useEffect(() => {
    if (
      ref.current ||
      refreshTokenFromUrl !== getRefreshTokenFormLocalStorage() ||
      accessTokenFromUrl !== getAccessTokenFormLocalStorage()
    ) {
      return
    }
    // check refrshtoken có giống trong localStorage không
    ref.current = mutateAsync
    mutateAsync().then(() => {
      setTimeout(() => {
        ref.current = null
      }, 1000)
      router.push('/login')
    })
  }, [mutateAsync, router, refreshTokenFromUrl,accessTokenFromUrl])
  return <div>Logout...</div>
}
