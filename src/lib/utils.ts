/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import authApiRequest from '@/apiRequests/auth'
import { toast } from '@/hooks/use-toast'
import { EntityError } from '@/lib/http'
import { clsx, type ClassValue } from 'clsx'
import jwt from 'jsonwebtoken'
import { UseFormSetError } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const normalizePath = (path: string) => {
  return path.startsWith('/') ? path.slice(1) : path
}
export const handleErrorApi = ({
  error,
  setError,
  duration
}: {
  error: any
  setError?: UseFormSetError<any>
  duration?: number
}) => {
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach((item) => {
      setError(item.field, {
        type: 'server',
        message: item.message
      })
    })
  } else {
    toast({
      title: 'Lỗi',
      description: error?.payload?.message ?? 'Lỗi không xác định',
      variant: 'destructive',
      duration: duration ?? 5000
    })
  }
}
const isBrowser = typeof window !== 'undefined'
export const getAccessTokenFormLocalStorage = () => (isBrowser ? localStorage.getItem('accessToken') : null)
export const getRefreshTokenFormLocalStorage = () => (isBrowser ? localStorage.getItem('refreshToken') : null)
export const setAccessTokenToLocalStorage = (value: string) => isBrowser && localStorage.setItem('accessToken', value)
export const setRefreshTokenToLocalStorage = (value: string) => isBrowser && localStorage.setItem('refreshToken', value)
export const removeTokensFromLocalStorage = () => {
  isBrowser && localStorage.removeItem('accessToken')
  isBrowser && localStorage.removeItem('refreshToken')
}
export const checkAndRefreshToken = async (param?: { onError?: () => void; onSuccess?: () => void }) => {
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
  const now = new Date().getTime() / 1000 - 1
  // trường hợp refresh token hết hạn thì cho logout
  if (decodedRefreshToken.exp <= now) {
    removeTokensFromLocalStorage()
    return param?.onError && param.onError()
  }
  // ví dụ nếu thời gian access token có thời gian hết hạn là 10s
  // thì sẽ kiểm tra còn 1/3 thời gian (3s) thì sẽ refresh token lại
  //thời gian còn lại là : decodedAccessToken.exp - now
  //thời gian hết hạn của access token - thời gian hiện tại: decodedAccessToken.exp - decodedAccessToken.iat
  if (decodedAccessToken.exp - now < (decodedAccessToken.exp - decodedAccessToken.iat) / 3) {
    try {
      const res = await authApiRequest.refreshToken()
      setAccessTokenToLocalStorage(res.payload.data.accessToken)
      setAccessTokenToLocalStorage(res.payload.data.refreshToken)
      if (param?.onSuccess) {
        param.onSuccess()
      }
    } catch {
      if (param?.onError) {
        param.onError()
      }
    }
  }
}
