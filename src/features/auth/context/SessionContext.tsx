'use client'

import { createContext, ReactNode, useContext } from 'react'
import type { AuthDetails } from '@/features/auth/types'

const SessionContext = createContext<AuthDetails | null>(null)

export const SessionProvider = ({
	value,
	children,
}: {
	value: AuthDetails
	children: ReactNode
}) => (
	<SessionContext.Provider value={value}>{children}</SessionContext.Provider>
)

export const useSessionContext = () => useContext(SessionContext)

export default SessionContext
