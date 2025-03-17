import envConfig from '@/config'
import { getAccessTokenFormLocalStorage } from '@/lib/utils'
import { io } from 'socket.io-client'
const socket = io(envConfig.NEXT_PUBLIC_API_ENDPOINT, {
  auth: {
    Authorization: `Bearer ${getAccessTokenFormLocalStorage()}`
  }
})

export default socket
