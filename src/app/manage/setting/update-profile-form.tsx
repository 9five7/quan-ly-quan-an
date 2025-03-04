'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { handleErrorApi } from '@/lib/utils'
import { useAccountQuery, useUpdateMeMutation } from '@/queries/useAccount'
import { useUploadImageMutation } from '@/queries/useMedia'
import { UpdateMeBody, UpdateMeBodyType } from '@/schemaValidations/account.schema'
import { zodResolver } from '@hookform/resolvers/zod'

import { Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

export default function UpdateProfileForm() {
  // State lưu trữ file ảnh được chọn
  const [file, setFile] = useState<File | null>(null)
  // Ref để tham chiếu đến input file (avatar)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  // Khởi tạo form với react-hook-form và zod để validate dữ liệu
  const form = useForm<UpdateMeBodyType>({
    resolver: zodResolver(UpdateMeBody),
    defaultValues: {
      name: '',
      avatar: undefined
    }
  })
  // Fetch dữ liệu tài khoản hiện tại
  const { data, refetch } = useAccountQuery()
  // Mutation để upload ảnh lên server
  const uploadImageMutation = useUploadImageMutation()
  // Mutation để cập nhật thông tin cá nhân
  const updateMeMutation = useUpdateMeMutation()
  // Lấy giá trị avatar và name từ form
  const avatar = form.watch('avatar')
  const name = form.watch('name')
  // Khi có dữ liệu user từ API, cập nhật lại form
  useEffect(() => {
    if (data) {
      const { name, avatar } = data.payload.data
      form.reset({ name, avatar: avatar ?? undefined }) // Nếu avatar null thì đặt undefined để tránh lỗi
    }
  }, [form, data])
  // Tạo ảnh preview: nếu có file mới, dùng URL.createObjectURL, nếu không thì dùng avatar từ API
  const previewAvatar = file ? URL.createObjectURL(file) : avatar
  // Hàm reset avatar về trạng thái ban đầu
  const resetAvatar = () => {
    setFile(null)
    form.reset()
  }
  const onSubmit = async (value: UpdateMeBodyType) => {
    if (updateMeMutation.isPending) return
    try {
      let body = value
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        const uploadImageResult = await uploadImageMutation.mutateAsync(formData)
        const imageUrl = uploadImageResult.payload.data
        body = {
          ...value,
          avatar: imageUrl
        }
      }
      const result = await updateMeMutation.mutateAsync(body)
      toast({
        description: result.payload.message
      })
      refetch()
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  return (
    <Form {...form}>
      <form
        noValidate
        className='grid auto-rows-max items-start gap-4 md:gap-8'
        onReset={resetAvatar}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Card x-chunk='dashboard-07-chunk-0'>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-6'>
              <FormField
                control={form.control}
                name='avatar'
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                render={({ field }) => (
                  <FormItem>
                    <div className='flex gap-2 items-start justify-start'>
                      <Avatar className='aspect-square w-[100px] h-[100px] rounded-md object-cover'>
                        <AvatarImage src={previewAvatar} />
                        <AvatarFallback className='rounded-none'>{name}</AvatarFallback>
                      </Avatar>
                      <input
                        type='file'
                        accept='image/*'
                        className='hidden'
                        ref={avatarInputRef}
                        onChange={(event) => {
                          const file = event.target.files?.[0]

                          if (file) {
                            setFile(file)
                          }
                        }}
                      />
                      <button
                        className='flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed'
                        type='button'
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <Upload className='h-4 w-4 text-muted-foreground' />
                        <span className='sr-only'>Upload</span>
                      </button>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid gap-3'>
                      <Label htmlFor='name'>Tên</Label>
                      <Input id='name' type='text' className='w-full' {...field} />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <div className=' items-center gap-2 md:ml-auto flex'>
                <Button variant='outline' size='sm' type='reset'>
                  Hủy
                </Button>
                <Button size='sm' type='submit'>
                  Lưu thông tin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
