import http from "@/lib/http";
import { LoginBodyType, LoginResType, LogoutBodyType } from "@/schemaValidations/auth.schema";

const authApiRequest={
    sLogin:(body:LoginBodyType)=>http.post<LoginResType>('/auth/login',body),
    login:(body:LoginBodyType)=>
        http.post<LoginResType>('/api/auth/login',body,{
            baseUrl:''
        }),
        
    sLogout:(body:LogoutBodyType & {accessToken:string})=>http.post('/auth/logout',{
        refreshToken:body.refreshToken // Gửi refreshToken lên server để xác thực
    },{
        headers:{
            Authorization:`Bearer ${body.accessToken}`
        }// Gửi accessToken lên server để xác thực
    }),
    
    logout:()=>http.post('/api/auth/logout',null,{
        baseUrl:''
    })
}
export default authApiRequest