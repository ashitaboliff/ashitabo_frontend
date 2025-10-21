'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import { getAuthDetails } from '@/domains/auth/api/authActions'
import { updateSession as requestSessionUpdate } from '@/domains/auth/api'
import type { AuthDetails } from '@/domains/auth/model/authTypes'
import type { Session } from '@/types/session'

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
	const { data, error, isLoading, mutate } = useSWR<AuthDetails>(
		AUTH_DETAILS_SWR_KEY,
		fetchDetails,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
			revalidateIfStale: false,
		},
	)

	const session = data?.session ?? null
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
		details: data ?? undefined,
	}
}
