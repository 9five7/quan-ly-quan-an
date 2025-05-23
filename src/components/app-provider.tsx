'use client'
import ListenLogoutSocket from '@/components/listen-logout-socket'
import RefreshToken from '@/components/refresh-token'
import { decodeToken, generateSocketInstance, getAccessTokenFormLocalStorage, removeTokensFromLocalStorage } from '@/lib/utils'
import { RoleType } from '@/types/jwt.types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})
const AppContext = createContext({
  isAuth: false,
  role: undefined as RoleType | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setRole: (role?: RoleType | undefined) => {},
  socket: undefined as Socket | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setSocket: (socket?: Socket | undefined) => {},
  disconnectSocket: () => {}
})
export const useAppContext = () => {
  return useContext(AppContext)
}
export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | undefined>()
  const [role, setRoleState] = useState<RoleType | undefined>()
  const count = useRef(0)
  useEffect(() => {
    if (count.current === 0) {
      const accessToken = getAccessTokenFormLocalStorage()
      if (accessToken) {
        const role = decodeToken(accessToken).role
        setRoleState(role)
        setSocket(generateSocketInstance(accessToken))
      }
      count.current++
    }
  }, [])
  const disconnectSocket = useCallback(() => {
    socket?.disconnect()
    setSocket(undefined)
  }, [socket, setSocket])
  const setRole = useCallback((role?: RoleType | undefined) => {
    setRoleState(role)
    if (!role) {
      removeTokensFromLocalStorage()
    }
  }, [])
  const isAuth = Boolean(role)
  return (
    <AppContext.Provider  value={{ role, setRole, isAuth, socket, setSocket, disconnectSocket }}>
      <QueryClientProvider client={queryClient}>
        {children}
        <RefreshToken />
        <ListenLogoutSocket />
      </QueryClientProvider>
    </AppContext.Provider>
  )
}
