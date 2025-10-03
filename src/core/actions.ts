import { apiRequest } from '@/lib/api'
import { ApiResponse, StatusCode } from '@/types/responseTypes'
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

	if (res.status === StatusCode.OK && Array.isArray(res.response)) {
		return res.response
	}
	return []
}

export const getYoutubeIdAction = async (): Promise<string[]> => {
	const res = await apiRequest<string[]>('/video/ids', {
		method: 'GET',
		cache: 'no-store',
	})
	if (res.status === StatusCode.OK && Array.isArray(res.response)) {
		return res.response
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

	if (
		res.status === StatusCode.OK &&
		Array.isArray(res.response)
	) {
		return {
			status: res.status,
			response: res.response.map(mapUserForSelect),
		}
	}

	return res
}
