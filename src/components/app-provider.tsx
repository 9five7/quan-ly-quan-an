'use client'
import RefreshToken from '@/components/refresh-token'
import { getAccessTokenFormLocalStorage } from '@/lib/utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false
    }
  }
})
const AppContext = createContext({
  isAuth: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setIsAuth: (isAuth: boolean) => {}
})
export const useAppContext = () => {
  return useContext(AppContext)
}
export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuthState] = useState(false)
  useEffect(() => {
    const accessToken = getAccessTokenFormLocalStorage()
    if (accessToken) {
      setIsAuthState(true)
    }
  }, [])
  const setIsAuth = useCallback((isAuth: boolean) => {
    if (isAuth) {
      setIsAuthState(true)
    } else {
      setIsAuthState(false)
    }
  }, [])
  return (
    <AppContext.Provider value={{ isAuth, setIsAuth }}>
      <QueryClientProvider client={queryClient}>
        {children}
        <RefreshToken />
      </QueryClientProvider>
    </AppContext.Provider>
  )
}
