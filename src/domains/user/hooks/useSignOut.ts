import { mutate } from 'swr'
import { signOut as signOutRequest } from '@/domains/auth/api'
import { AUTH_DETAILS_SWR_KEY } from '@/domains/auth/hooks/useSession'
import { logError } from '@/shared/utils/logger'
import type { ApiResponse } from '@/types/responseTypes'

export const signOutUser = async (): Promise<ApiResponse<null>> => {
	const result = await signOutRequest()
	if (result.ok) {
		try {
			await mutate(AUTH_DETAILS_SWR_KEY)
		} catch (error) {
			logError('Failed to revalidate session after sign out', error)
		}
	}
	return result
}
