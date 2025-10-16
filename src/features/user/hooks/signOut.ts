import { mutate } from 'swr'
import type { ApiResponse } from '@/types/responseTypes'
import { logError } from '@/utils/logger'
import { AUTH_DETAILS_SWR_KEY } from '@/features/auth/hooks/useSession'
import { signOut as signOutRequest } from '@/features/auth/api'

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
