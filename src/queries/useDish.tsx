import dishesApiRequest from '@/apiRequests/dishes'
import { UpdateDishBodyType } from '@/schemaValidations/dish.schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useDishListQuery = () => {
  return useQuery({
    queryKey: ['dishes'],
    queryFn: dishesApiRequest.list
  })
}
export const useDishQueryById = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ['dishes', id],
    queryFn: () => dishesApiRequest.getDish(id),
    enabled
  })
}
export const useAddDishMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: dishesApiRequest.add,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['dishes']
      })
    }
  })
}
export const useUpdateDishMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateDishBodyType & { id: number }) => dishesApiRequest.updateDish(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['dishes'],// // Làm mới danh sách món ăn sau khi cập nhật thành công
        exact: true//// Chỉ làm mới chính xác key ["dishes"], tránh làm mới các query con
      })
    }
  })
}
export const useDeleteDishMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: dishesApiRequest.deleteDish,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['dishes']
      })
    }
  })
}
