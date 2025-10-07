'use client'

import useSWR from 'swr'
import { getUnifiedAuthState } from '@/features/auth/components/actions'
import { UnifiedAuthResult } from '@/features/auth/types'
import type { Session } from '@/types/session'

export interface UseSessionResult {
	data: Session | null
	status: 'loading' | 'authenticated' | 'unauthenticated'
	error?: Error
	update: (arg?: unknown) => Promise<Session | null>
	mutate: (
		data?: UnifiedAuthResult | Promise<UnifiedAuthResult>,
	) => Promise<UnifiedAuthResult | undefined>
	unified?: UnifiedAuthResult
}

const fetchUnified = () => getUnifiedAuthState(true)

export const useSession = (): UseSessionResult => {
	const { data, error, isLoading, mutate } = useSWR<UnifiedAuthResult>(
		['unified-auth'],
		fetchUnified,
		{
			revalidateOnFocus: true,
			revalidateIfStale: true,
			revalidateOnReconnect: true,
		},
	)

	const session = data?.session ?? null
	const status: UseSessionResult['status'] = isLoading
		? 'loading'
		: session
			? 'authenticated'
			: 'unauthenticated'

	const update: UseSessionResult['update'] = async () => {
		const updated = await mutate(fetchUnified(), { revalidate: true })
		return updated?.session ?? null
	}

	return {
		data: session,
		status,
		error,
		update,
		mutate,
		unified: data,
	}
}
