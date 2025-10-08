'use client'

import useSWR from 'swr'
import { getAuthDetails } from '@/features/auth/components/actions'
import type { AuthDetails } from '@/features/auth/types'
import type { Session } from '@/types/session'
import { useSessionContext } from '@/features/auth/context/SessionContext'

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

const fetchDetails = () => getAuthDetails(true)

export const useSession = (): UseSessionResult => {
	const initialDetails = useSessionContext()
	const { data, error, isLoading, mutate } = useSWR<AuthDetails>(
		['auth-details'],
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

	const update: UseSessionResult['update'] = async () => {
		const updated = await mutate(fetchDetails(), { revalidate: true })
		return updated?.session ?? null
	}

	return {
		data: session,
		status,
		error,
		update,
		mutate,
		details: data ?? initialDetails ?? undefined,
	}
}
