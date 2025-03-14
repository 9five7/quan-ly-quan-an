import { Role } from '@/constants/type'
import { decodeToken } from '@/lib/utils'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const managePaths = ['/manage']
const guestPaths = ['/guest']
const privatePaths = [...managePaths, ...guestPaths]
const unAuthPaths = ['/login']
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value
  //nếu chưa đăng nhập thì không cho vào trang quản lý
  if (privatePaths.some((path) => pathname.startsWith(path)) && !refreshToken) {
    const url = new URL('/login', request.url)
    url.searchParams.set('clearTokens', 'true')
    return NextResponse.redirect(url)
  }
  // 2.Trường hợp đã đăng nhập
  if (refreshToken) {
    // 2.1 : nếu cố tình vào trang login  sẽ redirect về trang chủ
    if (unAuthPaths.some((path) => pathname.startsWith(path)) && refreshToken) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    // 2.2 : đăng nhập rồi mà hết hạn token
    if (privatePaths.some((path) => pathname.startsWith(path)) && !accessToken && refreshToken) {
      const url = new URL('/refresh-token', request.url)
      url.searchParams.set('refreshToken', refreshToken)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    //2.3 : vào ko đúng role thì redirect về trang chủ 
    const role=decodeToken(refreshToken).role
    // guest nhưng cố vào trang quản lý
    const isGuestToPathManage = managePaths.some((path) => pathname.startsWith(path)) && role === Role.Guest
    // manage nhưng cố vào trang guest
    const isManageToPathGuest = guestPaths.some((path) => pathname.startsWith(path)) && role !== Role.Guest
    if (isGuestToPathManage || isManageToPathGuest) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/manage/:path*','/guest/:path*', '/login']
}
