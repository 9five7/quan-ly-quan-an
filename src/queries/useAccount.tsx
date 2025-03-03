import accountApiRequest from '@/apiRequests/account'
import authApiRequest from '@/apiRequests/auth'
import { UpdateEmployeeAccountBodyType } from '@/schemaValidations/account.schema'
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
export const useAccountQueryById = (id: number) => {
  return useQuery({
    queryKey: ['accounts', id],
    queryFn: () => accountApiRequest.getEmployee(id)
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
        queryKey: ['accounts']
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
