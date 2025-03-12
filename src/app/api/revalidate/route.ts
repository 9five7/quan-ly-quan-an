import { revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'
//xử lý HTTP GET request.
export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get('tag')// kiểm tra url
  revalidateTag(tag!)//là một API của Next.js để xóa cache của dữ liệu liên quan đến tag.
  return Response.json({ revalidated: true, now: Date.now() })
}
