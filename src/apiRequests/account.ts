import http from '@/lib/http'
import {
  AccountListResType,
  AccountResType,
  ChangePasswordBodyType,
  CreateEmployeeAccountBodyType,
  UpdateEmployeeAccountBodyType,
  UpdateMeBodyType
} from '@/schemaValidations/account.schema'

const accountApiRequest = {
  me: () => http.get<AccountResType>('/accounts/me'),
  updateMe: (body: UpdateMeBodyType) => http.put<AccountResType>('/accounts/me', body),
  changePassword: (body: ChangePasswordBodyType) => http.put<AccountResType>('/accounts/change-password', body),
  list: () => http.get<AccountListResType>('/accounts'),
  addEmployee: (body: CreateEmployeeAccountBodyType) => http.post<AccountResType>('/accounts', body),
  updateEmployee: (id: number, body: UpdateEmployeeAccountBodyType) =>
    http.put<AccountResType>(`/accounts/detail/${id}`, body),
  getEmployee: (id: number) => http.get<AccountResType>(`/accounts/detail/${id}`),
  deleteEmployee: (id: number) => http.delete<AccountResType>(`/accounts/detail/${id}`)
}
export default accountApiRequest
