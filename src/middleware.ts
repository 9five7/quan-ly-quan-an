import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const privatePaths = ['/manage']
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
  //đăng nhập rồi thì không cho vào trang login nữa
  if (unAuthPaths.some((path) => pathname.startsWith(path)) && refreshToken) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  // đăng nhập rồi mà hết hạn token
  if (privatePaths.some((path) => pathname.startsWith(path)) && !accessToken && refreshToken) {
    const url = new URL('/refresh-token', request.url)
    url.searchParams.set('refreshToken', refreshToken)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/manage/:path*', '/login']
}
