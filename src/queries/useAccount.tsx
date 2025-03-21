import accountApiRequest from '@/apiRequests/account'
import authApiRequest from '@/apiRequests/auth'
import { GetGuestListQueryParamsType, UpdateEmployeeAccountBodyType } from '@/schemaValidations/account.schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.login
  })
}
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
export const useAccountListQuery = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: accountApiRequest.list
  })
}
export const useAccountQueryById = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ['accounts', id],
    queryFn: () => accountApiRequest.getEmployee(id),
    enabled
  })
}
export const useAddEmployeeMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: accountApiRequest.addEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['accounts']
      })
    }
  })
}
export const useUpdateEmployeeMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateEmployeeAccountBodyType & { id: number }) =>
      accountApiRequest.updateEmployee(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['accounts'],
        exact: true
      })
    }
  })
}
export const useDeleteEmployeeMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: accountApiRequest.deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['accounts']
      })
    }
  })
}
export const useGuestListQuery = (queryParams: GetGuestListQueryParamsType) => {
  return useQuery({
    queryFn: () => accountApiRequest.guestList(queryParams),
    queryKey: ['guests', queryParams]
  })
}
export const useCreateGuestMutation = () => {
  return useMutation({
    mutationFn: accountApiRequest.createGuest
  })
}