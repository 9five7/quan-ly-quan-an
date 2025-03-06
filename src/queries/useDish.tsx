import dishesApiRequest from '@/apiRequests/dishes'
import { useQuery } from '@tanstack/react-query'

export const useDishListQuery = () => {
  return useQuery({
    queryKey: ['dishes'],
    queryFn: dishesApiRequest.list
  })
}
