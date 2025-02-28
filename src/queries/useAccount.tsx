import accountApiRequest from '@/apiRequests/account'
import authApiRequest from '@/apiRequests/auth'
import { useMutation, useQuery } from '@tanstack/react-query'

export const useAccountQuery = () => {
  return useQuery({
    queryKey: ['account', 'me'],
    queryFn: accountApiRequest.me
  })
}

export const useUpdateMeMutation = () => {
  return useMutation({
    mutationFn: accountApiRequest.updateMe
  })
}

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: accountApiRequest.changePassword
  })
}
export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.logout
  })
}
