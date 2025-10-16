'use server'

import { apiGet } from '@/lib/api/crud'
import { failure, okResponse } from '@/lib/api/helper'
import type { ApiResponse } from '@/types/responseTypes'
import type { UserForSelect } from '@/features/user/types'

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
