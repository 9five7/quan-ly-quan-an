import authApiRequest from '@/apiRequests/auth'
import { cookies } from 'next/headers'

// Xử lý request POST (đăng nhập)
export async function POST() {
  // Khởi tạo cookieStore để thao tác với cookies
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value
  const refreshToken = cookieStore.get('refreshToken')?.value
  cookieStore.delete('accessToken')
  cookieStore.delete('refreshToken')
  if(!accessToken ||!refreshToken){
    return Response.json({
      message:'không có token'
    },{
      status:200
    })
  }
  try {
  const result = await authApiRequest.sLogout({
    refreshToken,
    accessToken
  })  
   return Response.json(result.payload)
  } catch (error) {
    console.log(error)
      return Response.json(
        {
          message: 'Lỗi khi gọi Api'
        },
        {
          status: 200
        }
      )
    }
  }

