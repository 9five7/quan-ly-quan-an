/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import authApiRequest from '@/apiRequests/auth'
import guestApiRequest from '@/apiRequests/guest'
import envConfig from '@/config'
import { DishStatus, OrderStatus, Role, TableStatus } from '@/constants/type'
import { toast } from '@/hooks/use-toast'
import { EntityError } from '@/lib/http'
import { TokenPayload } from '@/types/jwt.types'
import { clsx, type ClassValue } from 'clsx'
import { format } from 'date-fns'
import jwt from 'jsonwebtoken'
import { BookX, CookingPot, HandCoins, Loader, Truck } from 'lucide-react'
import { UseFormSetError } from 'react-hook-form'
import { io } from 'socket.io-client'
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
export const checkAndRefreshToken = async (param?: {
  onError?: () => void
  onSuccess?: () => void
  force?: boolean
}) => {
  // không nên đưa logic lấy access token và refresh token khỏi funcution này
  // vì để mỗi lần mà checkAndRefreshToken chạy thì nó sẽ lấy access token và refresh token mới
  //tránh hiện tượng bug nó lấy access token và refresh token cũ
  const accessToken = getAccessTokenFormLocalStorage()
  const refreshToken = getRefreshTokenFormLocalStorage()
  // chưa đăng nhập thì cũng ko cho chạy
  if (!accessToken || !refreshToken) return
  const decodedAccessToken = decodeToken(accessToken)
  // giải mã access token để lấy thời gian hết hạn
  const decodedRefreshToken = decodeToken(refreshToken)
  // giải mã refresh token để lấy thời gian hết hạn

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
  if (param?.force || decodedAccessToken.exp - now < (decodedAccessToken.exp - decodedAccessToken.iat) / 3) {
    try {
      const role = decodedRefreshToken.role
      const res = role === Role.Guest ? await guestApiRequest.refreshToken() : await authApiRequest.refreshToken()
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
export const getVietnameseDishStatus = (status: (typeof DishStatus)[keyof typeof DishStatus]) => {
  switch (status) {
    case DishStatus.Available:
      return 'Có sẵn'
    case DishStatus.Unavailable:
      return 'Không có sẵn'
    default:
      return 'Ẩn'
  }
}
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

export const getVietnameseTableStatus = (status: (typeof TableStatus)[keyof typeof TableStatus]) => {
  switch (status) {
    case TableStatus.Available:
      return 'Có sẵn'
    case TableStatus.Reserved:
      return 'Đã đặt'
    default:
      return 'Ẩn'
  }
}
export const getVietnameseOrderStatus = (status: (typeof OrderStatus)[keyof typeof OrderStatus]) => {
  switch (status) {
    case OrderStatus.Delivered:
      return 'Đã phục vụ'
    case OrderStatus.Paid:
      return 'Đã thanh toán'
    case OrderStatus.Pending:
      return 'Chờ xử lý'
    case OrderStatus.Processing:
      return 'Đang nấu'
    default:
      return 'Từ chối'
  }
}
export const getTableLink = ({ token, tableNumber }: { token: string; tableNumber: number }) => {
  return 'https://quan-ly-quan-an-81c8.vercel.app' + `/tables/` + tableNumber + '?token=' + token
}
export const decodeToken = (token: string) => {
  return jwt.decode(token) as TokenPayload
}
export function removeAccents(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
} // chuyển tiếng việt ko dấu

export const simpleMatchText = (fullText: string, matchText: string) => {
  return removeAccents(fullText.toLowerCase()).includes(removeAccents(matchText.trim().toLowerCase()))
} // kiểm tra matchText có khớp với fullText hay không
export const formatDateTimeToLocaleString = (date: string | Date) => {
  return format(date instanceof Date ? date : new Date(date), 'HH:mm:ss dd/MM/yyyy')
}
export const formatDateTimeToTimeString = (date: string | Date) => {
  return format(date instanceof Date ? date : new Date(date), 'HH:mm:ss')
}
export const generateSocketInstance = (accessToken: string) => {
  return io(envConfig.NEXT_PUBLIC_API_ENDPOINT, {
    auth: {
       Authorization: `Bearer ${accessToken}`
    }
  })
}
export const OrderStatusIcon = {
  [OrderStatus.Pending]: Loader,
  [OrderStatus.Processing]: CookingPot,
  [OrderStatus.Rejected]: BookX,
  [OrderStatus.Delivered]: Truck,
  [OrderStatus.Paid]: HandCoins
}
