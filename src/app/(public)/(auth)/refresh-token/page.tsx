'use client'
import { checkAndRefreshToken, getRefreshTokenFormLocalStorage } from '@/lib/utils'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

function RefreshToken() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const refreshTokenFromUrl = searchParams.get('refreshToken')
  const redirectPathname = searchParams.get('redirect')

  useEffect(() => {
    if (refreshTokenFromUrl && refreshTokenFromUrl === getRefreshTokenFormLocalStorage()) {
      checkAndRefreshToken({
        onSuccess: () => {
          router.push(redirectPathname || '/')
        }
      })
    } else {
      router.push('/')
    }
    // check refrshtoken có giống trong localStorage không
  }, [router, refreshTokenFromUrl, redirectPathname])
  return <div>refresh token...</div>
}

export default function RefreshTokenPage() {
  ;<Suspense fallback={<div>Loading...</div>}>
    <RefreshToken />
  </Suspense>
}
