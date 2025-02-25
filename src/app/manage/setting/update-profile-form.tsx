'use client'
import accountApiRequest from '@/apiRequests/account'
import mediaApiRequest from '@/apiRequests/media'
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
  const [file, setFile] = useState<File | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const form = useForm<UpdateMeBodyType>({
    resolver: zodResolver(UpdateMeBody),
    defaultValues: {
      name: '',
      avatar: ''
    }
  })
  const {data,refetch} = useAccountQuery()
  const uploadImageMutation = useUploadImageMutation()
  const updateMeMutation = useUpdateMeMutation()
  const avatar = form.watch('avatar')
  const name = form.watch('name')
  useEffect(() => {
    if (data) {
      const { name, avatar } = data.payload.data
      form.reset({ name, avatar: avatar ?? '' })
    }
  }, [form, data])
  const previewAvatar = file ? URL.createObjectURL(file) : avatar
  const resetAvatar = () => {
    setFile(null)
    form.reset()
  }
  const onSubmit = async (value: UpdateMeBodyType) => {
    if(updateMeMutation.isPending ) return
    try {
      let body= value
      if (file) {
       const formData= new FormData()
       formData.append('file', file)
       const uploadImageResult = await uploadImageMutation.mutateAsync(formData)
      const imageUrl= uploadImageResult.payload.data
      body={
        ...value,
        avatar: imageUrl
      }
      }
      const result = await updateMeMutation.mutateAsync(body)
      toast({
        description: result.payload.message,
      })
      refetch()
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  return (
    <Form {...form}>
      <form noValidate className='grid auto-rows-max items-start gap-4 md:gap-8' onReset={resetAvatar} onSubmit={form.handleSubmit(onSubmit)}>
        <Card x-chunk='dashboard-07-chunk-0'>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-6'>
              <FormField
                control={form.control}
                name='avatar'
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
