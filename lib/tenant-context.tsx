'use client'
import { createContext, useContext, ReactNode } from 'react'

interface TenantContextType {
  companyId: string
  companyName: string
  isGlobalAdmin: boolean
  userId: string
  userRole: string
  userName: string
  userEmail: string
  agents: string[]
  tenantFilter: () => { companyId: string } | {}
}

const TenantContext = createContext<TenantContextType>({
  companyId: '', companyName: '', isGlobalAdmin: false,
  userId: '', userRole: '', userName: '', userEmail: '', agents: [],
  tenantFilter: () => ({}),
})

interface TenantProviderProps {
  children: ReactNode
  user: {
    id: string; email: string; name: string; role: string;
    agents: string[]; companyId: string; companyName: string;
  }
}

export function TenantProvider({ children, user }: TenantProviderProps) {
  const isGlobalAdmin = user.role === 'super_admin'
  const tenantFilter = () => isGlobalAdmin ? {} : { companyId: user.companyId }

  return (
    <TenantContext.Provider value={{
      companyId: user.companyId,
      companyName: user.companyName,
      isGlobalAdmin,
      userId: user.id,
      userRole: user.role,
      userName: user.name,
      userEmail: user.email,
      agents: user.agents,
      tenantFilter,
    }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  return useContext(TenantContext)
}

export function filterByTenant<T extends { companyId?: string }>(
  data: T[], companyId: string, isGlobalAdmin: boolean
): T[] {
  if (isGlobalAdmin) return data
  return data.filter(item => item.companyId === companyId)
}
