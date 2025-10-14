'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { AuthDetails } from '@/features/auth/types'

const SessionContext = createContext<AuthDetails | null>(null)

export const SessionProvider = ({
	value,
	children,
}: {
	value: AuthDetails
	children: ReactNode
}) => <SessionContext value={value}>{children}</SessionContext>

export const useSessionContext = () => useContext(SessionContext)

export default SessionContext
