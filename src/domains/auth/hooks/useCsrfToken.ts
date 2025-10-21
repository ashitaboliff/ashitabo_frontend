'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import { fetchCsrfToken } from '@/domains/auth/api'

const CSRF_SWR_KEY = 'auth/padlock/csrf'

export const useCsrfToken = (initialToken?: string | null) => {
	const fallbackToken =
		initialToken && initialToken.length > 0 && initialToken !== 'undefined'
			? initialToken
			: null
	const { data, isValidating, mutate } = useSWR<string | null>(
		CSRF_SWR_KEY,
		fetchCsrfToken,
		{
			fallbackData: fallbackToken,
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
			revalidateIfStale: false,
			revalidateOnMount: true,
		},
	)

	const refreshCsrf = useCallback(async () => {
		const token = (await mutate()) ?? null
		return token
	}, [mutate])

	const ensureCsrfToken = useCallback(async () => {
		if (data && data.length > 0) {
			return data
		}
		return refreshCsrf()
	}, [data, refreshCsrf])

	return {
		csrfToken: data ?? null,
		isFetching: isValidating,
		refreshCsrf,
		ensureCsrfToken,
	}
}
