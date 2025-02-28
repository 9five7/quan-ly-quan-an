/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import authApiRequest from '@/apiRequests/auth'
import {
  getAccessTokenFormLocalStorage,
  getRefreshTokenFormLocalStorage,
  setAccessTokenToLocalStorage
} from '@/lib/utils'
import jwt from 'jsonwebtoken'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const UNAUTHENTIACATED_PATHS = ['/login', '/register', '/refresh-token']
export default function RefreshToken() {
  const pathname = usePathname()
  useEffect(() => {
    if (UNAUTHENTIACATED_PATHS.includes(pathname)) return // check xem path có trong mảng không
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let interval: any = null
    const checkAndRefreshToken = async () => {
      // không nên đưa logic lấy access token và refresh token khỏi funcution này
      // vì để mỗi lần mà checkAndRefreshToken chạy thì nó sẽ lấy access token và refresh token mới
      //tránh hiện tượng bug nó lấy access token và refresh token cũ
      const accessToken = getAccessTokenFormLocalStorage()
      const refreshToken = getRefreshTokenFormLocalStorage()
      // chưa đăng nhập thì cũng ko cho chạy
      if (!accessToken || !refreshToken) return
      const decodedAccessToken = jwt.decode(accessToken) as { iat: number; exp: number }
      // giải mã access token để lấy thời gian hết hạn
      const decodedRefreshToken = jwt.decode(refreshToken) as {
        iat: number
        exp: number
        // giải mã refresh token để lấy thời gian hết hạn
      }
      const now = new Date().getTime() / 1000
      if (decodedRefreshToken.exp <= now) return
      // ví dụ nếu thời gian access token có thời gian hết hạn là 10s
      // thì sẽ kiểm tra còn 1/3 thời gian (3s) thì sẽ refresh token lại
      //thời gian còn lại là : decodedAccessToken.exp - now
      //thời gian hết hạn của access token - thời gian hiện tại: decodedAccessToken.exp - decodedAccessToken.iat
      if (decodedAccessToken.exp - now < (decodedAccessToken.exp - decodedAccessToken.iat) / 3) {
        try {
          const res = await authApiRequest.refreshToken()
          setAccessTokenToLocalStorage(res.payload.data.accessToken)
          setAccessTokenToLocalStorage(res.payload.data.refreshToken)
        } catch (error) {
          clearInterval(interval) // nếu lỗi thì dừng việc refresh token
        }
      }
    }
    // phải chạy checkAndRefreshToken 1 lần khi mới vào trang
    checkAndRefreshToken()
    const TIMEOUT = 1000
    interval = setInterval(checkAndRefreshToken, TIMEOUT)
    return () => clearInterval(interval)
  }, [pathname])
  return null
}
