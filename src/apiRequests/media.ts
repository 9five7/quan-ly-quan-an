import http from '@/lib/http'
import { UploadImageResType } from '@/schemaValidations/media.schema'

const mediaApiRequest = {
  uploadImage: (body: FormData) => http.post<UploadImageResType>('/media/upload', body)
}

export default mediaApiRequest
