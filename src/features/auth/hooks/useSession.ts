'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import { getAuthDetails } from '@/features/auth/actions'
import type { AuthDetails } from '@/features/auth/types'
import type { Session } from '@/types/session'
import { useSessionContext } from '@/features/auth/context/SessionContext'
import { updateSession as requestSessionUpdate } from '@/features/auth/api'

export interface UseSessionResult {
	data: Session | null
	status: 'loading' | 'authenticated' | 'unauthenticated'
	error?: Error
	update: (arg?: unknown) => Promise<Session | null>
	mutate: (
		data?: AuthDetails | Promise<AuthDetails>,
	) => Promise<AuthDetails | undefined>
	details?: AuthDetails
}

export const AUTH_DETAILS_SWR_KEY = ['auth-details'] as const

const fetchDetails = () => getAuthDetails(true)

/**
 * クライアント側でセッション情報を取得・管理するためのフック
 * @returns {UseSessionResult} セッション情報と更新関数など
 */
export const useSession = (): UseSessionResult => {
	const initialDetails = useSessionContext()
	const { data, error, isLoading, mutate } = useSWR<AuthDetails>(
		AUTH_DETAILS_SWR_KEY,
		fetchDetails,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
			revalidateIfStale: false,
			fallbackData: initialDetails ?? undefined,
			revalidateOnMount: !initialDetails,
		},
	)

	const session = data?.session ?? initialDetails?.session ?? null
	const status: UseSessionResult['status'] = isLoading
		? 'loading'
		: session
			? 'authenticated'
			: 'unauthenticated'

	const update = useCallback<UseSessionResult['update']>(
		async (payload) => {
			const data =
				payload && typeof payload === 'object' && !Array.isArray(payload)
					? (payload as Record<string, unknown>)
					: undefined
			await requestSessionUpdate(data)
			const updated = await mutate(fetchDetails(), { revalidate: true })
			return updated?.session ?? null
		},
		[mutate],
	)

	return {
		data: session,
		status,
		error,
		update,
		mutate,
		details: data ?? initialDetails ?? undefined,
	}
}
