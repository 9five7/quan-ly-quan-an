import indicatorApiRequest from '@/apiRequests/indicator'
import { DashboardIndicatorQueryParamsType } from '@/schemaValidations/indicator.schema'
import { useQuery } from '@tanstack/react-query'

export const useIndicatorQuery = (queryParams: DashboardIndicatorQueryParamsType) => {
  return useQuery({
    queryFn: () => indicatorApiRequest.getIndicator(queryParams),
    queryKey: ['indicator-dashboard', queryParams],
  })
}
