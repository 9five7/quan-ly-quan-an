'use client'
import RefreshToken from '@/components/refresh-token'
import { decodeToken, getAccessTokenFormLocalStorage, removeTokensFromLocalStorage } from '@/lib/utils'
import { RoleType } from '@/types/jwt.types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

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
  setRole: (role?: RoleType) => {}
})
export const useAppContext = () => {
  return useContext(AppContext)
}
export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<RoleType | undefined>()
  useEffect(() => {
    const accessToken = getAccessTokenFormLocalStorage()
    if (accessToken) {
      const role = decodeToken(accessToken).role
      setRoleState(role)
    }
  }, [])
  const setRole = useCallback((role?: RoleType | undefined) => {
    setRoleState(role)
    if (!role) {
      removeTokensFromLocalStorage()
    }
  }, [])
  const isAuth = Boolean(role)
  return (
    <AppContext.Provider value={{ isAuth, setRole, role }}>
      <QueryClientProvider client={queryClient}>
        {children}
        <RefreshToken />
      </QueryClientProvider>
    </AppContext.Provider>
  )
}
