"use client"
 
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import envConfig from "@/config"
import { LoginBody, LoginBodyType } from "@/schemaValidations/auth.schema"


import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

export default function LoginForm() {
    const form = useForm<LoginBodyType>({
        resolver: zodResolver(LoginBody),
        defaultValues: {
          email:'',
          password:'',
        },
      })
     
      // 2. Define a submit handler.
      async function onSubmit(values:LoginBodyType ) {
       const result= await fetch(`${envConfig.NEXT_PUBLIC_API_ENDPOINT}/auth/login`,{
          body:JSON.stringify(values),
          headers:{
            'Content-Type':'application/json'
          }
        }).then((res)=>res.json())
        console.log(result)
      }
      return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 max-w-[500px] w-full">
              <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email của bạn" type="email"{...field} />
                  </FormControl>
                
                  <FormMessage />
                </FormItem>
              )}
            />
              <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <Input placeholder="Mật khẩu" type="password"{...field} />
                  </FormControl>
                
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="!mt-8 w-full">Đăng nhập</Button>
          </form>
        </Form>
      )
}
