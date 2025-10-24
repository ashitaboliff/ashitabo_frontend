'use server'

import type { Profile, UserForSelect } from '@/domains/user/model/userTypes'
import { apiGet } from '@/shared/lib/api/crud'
import { failure, okResponse } from '@/shared/lib/api/helper'
import type { ApiResponse } from '@/types/responseTypes'

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

export const getUserProfile = async (
	userId: string,
): Promise<ApiResponse<Profile>> => {
	const response = await apiGet<Profile>(`/users/${userId}/profile`, {
		cache: 'default',
		next: { revalidate: 30 * 24 * 60 * 60, tags: [`user-profile-${userId}`] },
	})

	if (response.ok) {
		return okResponse(response.data)
	}

	return failure(response.status, 'ユーザー情報の取得に失敗しました。')
}
