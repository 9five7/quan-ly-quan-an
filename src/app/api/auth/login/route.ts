import authApiRequest from '@/apiRequests/auth'
import { HttpError } from '@/lib/http'
import { LoginBodyType } from '@/schemaValidations/auth.schema'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
// Xử lý request POST (đăng nhập)
export async function POST(request: Request) {
  const res = (await request.json()) as LoginBodyType
  // Khởi tạo cookieStore để thao tác với cookies
  const cookieStore = cookies()
  try {
  
    const { payload } = await authApiRequest.sLogin(res)
       // Trích xuất accessToken và refreshToken từ payload
    const {
      data: { accessToken, refreshToken }
    } = payload
     // Giải mã accessToken để lấy thời gian hết hạn (exp)
    const decodedAccessToken = jwt.decode(accessToken) as { exp: number }
    const decodedRefreshToken = jwt.decode(refreshToken) as { exp: number }
 // Lưu accessToken vào cookie
    ;(await cookieStore).set('accessToken', accessToken, {
      path: '/',// Áp dụng cho toàn bộ trang web
      httpOnly: true, // Chỉ có thể truy cập từ server, tránh bị JS trên client đọc
      sameSite: 'lax',// Chống tấn công CSRF
      secure: true,// Chỉ gửi cookie qua HTTPS
      expires: new Date(decodedAccessToken.exp * 1000)// Đặt thời gian hết hạn theo token
    })
        // Lưu refreshToken vào cookie
    ;(await cookieStore).set('refreshToken', refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: new Date(decodedRefreshToken.exp * 1000)
    })
    // Trả về payload từ API (chứa thông tin user + token)
    return Response.json(payload)
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json(error.payload, {
        status: error.status
      })
    } else {
      return Response.json(
        {
          message: 'Lỗi không xác định'
        },
        {
          status: 500
        }
      )
    }
  }
}
