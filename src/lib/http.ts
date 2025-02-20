import envConfig from "@/config";
import { normalizePath } from "@/lib/utils";
import { LoginResType } from "@/schemaValidations/auth.schema";
import { redirect } from "next/navigation";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Định nghĩa kiểu dữ liệu cho `options` của request
type CustomOptions=Omit<RequestInit,'method'> &{
    baseUrl?:string |undefined
}
const ENTITY_ERROR_STATUS=422
const AUTHENTICATION_ERROR_STATUS=401
// Kiểu dữ liệu cho lỗi thực thể
type EntityErrorPayload={
    message:string
    error:{
        field:string
        message:string
    }[]
}
// Lớp xử lý lỗi HTTP chung
export class HttpError extends Error{
    status:number
    payload:{
        message:string
        [key :string]:any
    }
    constructor({status,payload,message='lỗi http'}:{status:number;payload:any;message?:string}){
        super(message)
        this.status=status
        this.payload=payload
    }
}
// Lớp xử lý lỗi thực thể, kế thừa từ `HttpError`
export class EntityError extends HttpError{
    status: typeof ENTITY_ERROR_STATUS
    payload: EntityErrorPayload
    constructor({
        status,
        payload
    }:{
        status:typeof ENTITY_ERROR_STATUS
        payload:EntityErrorPayload
    }){
        super({status,payload,message:'lỗi thực thể'})
        this.status=status
        this.payload=payload
    }
}
// Biến toàn cục để kiểm soát request logout chỉ thực hiện một lần
let clientLogoutRequest:null|Promise<any>=null
// Kiểm tra xem code đang chạy trên client hay server
const  isClient= typeof window!== undefined
// Hàm gửi request HTTP
const request=async <Response>(method:'GET'|'POST'|'PUT'|'DELETE',url:string,options?:CustomOptions |undefined)=>{
    let body:FormData|string|undefined=undefined
    // xử lý body request nếu là FormData thì giữ nguyên nếu là object thì chuyển thành file JSON
    if(options?.body instanceof FormData){
        body=options.body
    }else if (options?.body){
        body=JSON.stringify(options.body)
    }
    const baseHeaders:{
        [key :string]:string
    }=
    body instanceof FormData ?{}:{
        'Content-Type': 'application/json'
    }
     // Nếu đang chạy trên client, thêm token xác thực vào headers
    if(isClient){
        const accessToken=localStorage.getItem('accessToken')
        if(accessToken){
            baseHeaders.Authorization=`Bearer${accessToken}`
        }
    }

    //nếu không truyền baseUrl (hoặc baseUrl = undefiled) thì lấy từ envConfig.NEXT_PUBLIC_API_ENDPOINT
    //nếu truyền baseUrl thì lấy giá trị truyền vào
    const baseUrl=options?.baseUrl=== undefined ?envConfig.NEXT_PUBLIC_API_ENDPOINT :options.baseUrl
    const fullUrl =`${baseUrl}/${normalizePath(url)}`
      // Gửi request đến server
    const res=await fetch(fullUrl,{
        ...options,
        headers:{
            ...baseHeaders,
            ...options?.headers
        } as any,
        body,
        method
    }


    )
    // Parse dữ liệu JSON trả về
    const payload:Response=await res.json()
    const data ={
        status:res.status,
        payload
    }
    // Kiểm tra nếu request thất bại
    if(!res.ok){
      if(res.status=== ENTITY_ERROR_STATUS){
          // Nếu lỗi là lỗi thực thể (422), ném lỗi `EntityError`
        throw new EntityError (
            data as {
                status:422
                payload:EntityErrorPayload
            }
        )
      } else if(res.status===AUTHENTICATION_ERROR_STATUS){
         // Nếu lỗi xác thực (401), thực hiện đăng xuất
        if(isClient){
            if(!clientLogoutRequest){
                clientLogoutRequest=fetch('/api/auth/logout',{
                    method:'POST',
                    body:null,
                    headers:{
                        ...baseHeaders
                    }as any
                })
                try {
                    await clientLogoutRequest
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (error) {
                }finally{
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refreshToken')
                    // redirect veef trang login có thể dẫn dến  loop vô hạn
                    // Nếu không được xử lý đúng cách
                    // vì nếu  rơi vào trường hợp tại trang login , chúng ta  có gọi các api cần  access token 
                    //mà access token đã bị xoá tại đây , nên nó sẽ bị lặp đi lặp lại vô hạn
                    clientLogoutRequest=null
                    location.href='/login'
                }
            }
        }else{
            // Nếu đang chạy trên server, thực hiện redirect đến `/logout`
            const accessToken=(options?.headers as any)?.Authorization.split(
                'Bearer'
            )[1]
            redirect(`/logout?accessToken=${accessToken}`)
        }
      }else{
        throw new HttpError(data)
      }
    }
       // Nếu request thành công, kiểm tra nếu là login/logout để cập nhật token
    if(isClient){
        const normalizeUrl=normalizePath(url)
        if(normalizeUrl==='api/auth/login'){
            // Nếu là request đăng nhập, lưu accessToken và refreshToken vào localStorage
            const {accessToken,refreshToken}=(payload as LoginResType).data
            localStorage.setItem('accessToken',accessToken)
            localStorage.setItem('refreshToken',refreshToken)
        }else if( normalizeUrl ==='api/auth/logout'){   
             // Nếu là request đăng xuất, xóa token khỏi localStorage
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
    } 
}
return data // Trả về dữ liệu từ server
}
const http ={
    get<Response>(url:string,options?: Omit<CustomOptions,'body'>| undefined){
        return request<Response>('GET',url,options)
    },
    post<Response>(url:string,body: any,options?: Omit<CustomOptions,'body'>| undefined){
        return request<Response>('POST',url,{options,...body})
    },
    put<Response>(url:string,body: any,options?: Omit<CustomOptions,'body'>| undefined){
        return request<Response>('PUT',url,{options,...body})
    },
    delete<Response>(url:string,body: any,options?: Omit<CustomOptions,'body'>| undefined){
        return request<Response>('DELETE',url,{options,...body})
    }
}
export default http