import { ApiResponse, StatusCode } from '@/types/responseTypes'
import { failure, noContentResponse, okResponse } from '@/lib/api/helper'
import { apiGet } from '@/lib/api/crud'
import type { UserForSelect } from '@/features/user/types'

import { getFrontendOrigin } from '@/lib/env'

const buildSignOutUrl = () => {
	if (typeof window !== 'undefined') {
		return '/api/auth/signout'
	}
	return `${getFrontendOrigin()}/api/auth/signout`
}

export const signOutUser = async (): Promise<ApiResponse<null>> => {
	try {
		const response = await fetch(buildSignOutUrl(), {
			method: 'POST',
			credentials: 'include',
			redirect: 'follow',
		})

		if (response.ok || response.status === 302) {
			return noContentResponse()
		}

		const message = await response.text()
		let status: StatusCode
		switch (response.status) {
			case StatusCode.BAD_REQUEST:
			case StatusCode.UNAUTHORIZED:
			case StatusCode.FORBIDDEN:
			case StatusCode.NOT_FOUND:
			case StatusCode.CONFLICT:
				status = response.status
				break
			default:
				status = StatusCode.INTERNAL_SERVER_ERROR
				break
		}
		return failure(status, message || 'Failed to sign out')
	} catch (error) {
		return failure(
			StatusCode.INTERNAL_SERVER_ERROR,
			error instanceof Error ? error.message : 'Sign out error',
		)
	}
}

export const getUsersForSelect = async (): Promise<
	ApiResponse<UserForSelect[]>
> => {
	const response = await apiGet<UserForSelect[]>('/users/select', {
		cache: 'no-store',
		next: { revalidate: 24 * 60 * 60, tags: ['users-select'] },
	})

	if (response.ok) {
		return okResponse(response.data)
	}

	return failure(response.status, 'ユーザー情報の取得に失敗しました。')
}
