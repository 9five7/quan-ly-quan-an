import mediaApiRequest from '@/apiRequests/media'
import { useMutation } from '@tanstack/react-query'

export const useUploadImageMutation = () => {
  return useMutation({
    mutationFn: mediaApiRequest.uploadImage
  })
}
