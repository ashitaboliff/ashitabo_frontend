import { apiRequest } from '@/lib/api'
import { ApiResponse } from '@/types/responseTypes'
import { mapSuccess, withFallbackMessage } from '@/lib/api/helper'
import { Part } from '@/features/user/types'

export interface UserForSelectProfile {
	name?: string | null
	part?: Part[] | null
}

export interface UserForSelect {
	id: string
	name: string | null
	image?: string | null
	profile?: UserForSelectProfile | null
}

export const redirectFrom = async (target: string, _fallback: string) => {
	const { redirect } = await import('next/navigation')
	redirect(target)
}

export const getBookingIdAction = async (): Promise<string[]> => {
	const res = await apiRequest<string[]>('/booking/ids', {
		method: 'GET',
		cache: 'no-store',
	})

	if (res.ok && Array.isArray(res.data)) {
		return res.data
	}
	return []
}

export const getYoutubeIdAction = async (): Promise<string[]> => {
	const res = await apiRequest<string[]>('/video/ids', {
		method: 'GET',
		cache: 'no-store',
	})
	if (res.ok && Array.isArray(res.data)) {
		return res.data
	}
	return []
}

const mapUserForSelect = (input: any): UserForSelect => ({
	id: input.id,
	name: input.name ?? null,
	image: input.image ?? null,
	profile: input.profile
		? {
				name: input.profile.name ?? null,
				part: input.profile.part ?? null,
			}
		: null,
})

export const getAllUsersForSelectAction = async (): Promise<
	ApiResponse<UserForSelect[]>
> => {
	const res = await apiRequest<UserForSelect[]>('/users/select', {
		method: 'GET',
		cache: 'no-store',
	})

	return mapSuccess(
		res,
		(payload) => (payload ?? []).map(mapUserForSelect),
		'ユーザー情報の取得に失敗しました。',
	)
}
