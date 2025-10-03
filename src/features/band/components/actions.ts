import { apiRequest } from '@/lib/api'
import { ApiResponse, StatusCode } from '@/types/responseTypes'
import {
	BandDetails,
	BandMemberDetails,
	BandMemberUserSummary,
	CreateBandResponse,
	UpdateBandResponse,
	AddBandMemberResponse,
	UpdateBandMemberResponse,
	RemoveBandMemberResponse,
	UserWithProfile,
} from '@/features/band/types'
import type { Part } from '@/features/user/types'

const mapMemberUser = (input: any): BandMemberUserSummary => ({
	id: input.id,
	name: input.name ?? null,
	image: input.image ?? null,
	user_id: input.user_id ?? input.id ?? null,
	profile: input.profile
		? {
			name: input.profile.name ?? null,
			part: input.profile.part ?? null,
			studentId: input.profile.studentId ?? null,
			expected: input.profile.expected ?? null,
			role: input.profile.role ?? null,
		}
		: null,
})

const mapMember = (input: any): BandMemberDetails => ({
	id: input.id,
	bandId: input.bandId,
	userId: input.userId,
	part: input.part,
	createdAt: new Date(input.createdAt),
	updatedAt: new Date(input.updatedAt),
	user: mapMemberUser(input.user ?? {}),
})

const mapBandDetails = (input: any): BandDetails => ({
	id: input.id,
	name: input.name,
	description: input.description ?? null,
	createdAt: new Date(input.createdAt),
	updatedAt: new Date(input.updatedAt),
	isDeleted: input.isDeleted ?? false,
	members: Array.isArray(input.members)
		? (input.members as any[]).map(mapMember)
		: [],
})

const mapUserWithProfile = (input: any): UserWithProfile => ({
	id: input.id,
	name: input.name ?? null,
	image: input.image ?? null,
	user_id: input.user_id ?? input.id ?? null,
	profile: input.profile
		? {
			name: input.profile.name ?? null,
			part: input.profile.part ?? null,
			studentId: input.profile.studentId ?? null,
			expected: input.profile.expected ?? null,
			role: input.profile.role ?? null,
		}
		: null,
})

export const getBandDetailsAction = async (
	bandId: string,
): Promise<ApiResponse<BandDetails>> => {
	const res = await apiRequest<BandDetails>(`/band/${bandId}`, {
		method: 'GET',
		cache: 'no-store',
	})

	if (
		res.status === StatusCode.OK &&
		typeof res.response !== 'string'
	) {
		return {
			status: res.status,
			response: mapBandDetails(res.response),
		}
	}

	return res as ApiResponse<BandDetails>
}

export const getUserBandsAction = async (): Promise<
	ApiResponse<BandDetails[]>
> => {
	const res = await apiRequest<BandDetails[]>('/band/me', {
		method: 'GET',
		cache: 'no-store',
	})

	if (
		res.status === StatusCode.OK &&
		Array.isArray(res.response)
	) {
		return {
			status: res.status,
			response: res.response.map(mapBandDetails),
		}
	}

	return res as ApiResponse<BandDetails[]>
}

export const createBandAction = async (
	formData: FormData,
): Promise<CreateBandResponse> => {
	const name = String(formData.get('name') ?? '').trim()
	const res = await apiRequest<{ id: string }>('/band', {
		method: 'POST',
		body: { name },
	})

	if (
		res.status === StatusCode.CREATED &&
		res.response &&
		typeof res.response !== 'string'
	) {
		const details = await getBandDetailsAction(res.response.id)
		if (
			details.status === StatusCode.OK &&
			details.response &&
			typeof details.response !== 'string'
		) {
			return {
				status: StatusCode.CREATED,
				response: details.response,
			}
		}
		return details as CreateBandResponse
	}

	return {
		status: res.status as StatusCode,
		response:
			typeof res.response === 'string'
				? res.response
				: 'バンドの作成に失敗しました。',
	} as CreateBandResponse
}

export const updateBandAction = async (
	bandId: string,
	formData: FormData,
): Promise<UpdateBandResponse> => {
	const name = String(formData.get('name') ?? '').trim()
	const res = await apiRequest(`/band/${bandId}`, {
		method: 'PUT',
		body: { name },
	})

	if (res.status === StatusCode.NO_CONTENT) {
		const details = await getBandDetailsAction(bandId)
		if (
			details.status === StatusCode.OK &&
			details.response &&
			typeof details.response !== 'string'
		) {
			return {
				status: StatusCode.OK,
				response: details.response,
			}
		}
		return details as UpdateBandResponse
	}

	return {
		status: res.status as StatusCode,
		response:
			typeof res.response === 'string'
				? res.response
				: 'バンドの更新に失敗しました。',
	} as UpdateBandResponse
}

export const deleteBandAction = async (
	bandId: string,
): Promise<ApiResponse<null>> => {
	const res = await apiRequest(`/band/${bandId}`, {
		method: 'DELETE',
	})

	if (res.status === StatusCode.NO_CONTENT) {
		return { status: StatusCode.NO_CONTENT, response: null }
	}

	return res as ApiResponse<null>
}

export const addBandMemberAction = async (
	bandId: string,
	userId: string,
	part: Part,
): Promise<AddBandMemberResponse> => {
	const res = await apiRequest(`/band/${bandId}/members`, {
		method: 'POST',
		body: { userId, part },
	})

	if (res.status === StatusCode.CREATED) {
		return { status: StatusCode.CREATED, response: null }
	}

	return {
		status: res.status as StatusCode,
		response:
			typeof res.response === 'string'
				? res.response
				: 'メンバーの追加に失敗しました。',
	} as AddBandMemberResponse
}

export const updateBandMemberAction = async (
	bandMemberId: string,
	part: Part,
): Promise<UpdateBandMemberResponse> => {
	const res = await apiRequest(`/band/members/${bandMemberId}`, {
		method: 'PUT',
		body: { part },
	})

	if (res.status === StatusCode.NO_CONTENT) {
		return { status: StatusCode.OK, response: null }
	}

	return {
		status: res.status as StatusCode,
		response:
			typeof res.response === 'string'
				? res.response
				: 'メンバーの更新に失敗しました。',
	} as UpdateBandMemberResponse
}

export const removeBandMemberAction = async (
	bandMemberId: string,
): Promise<RemoveBandMemberResponse> => {
	const res = await apiRequest(`/band/members/${bandMemberId}`, {
		method: 'DELETE',
	})

	if (res.status === StatusCode.NO_CONTENT) {
		return { status: StatusCode.NO_CONTENT, response: null }
	}

	return res as RemoveBandMemberResponse
}

export const getAvailablePartsAction = async (): Promise<
	ApiResponse<Part[]>
> => {
	const res = await apiRequest<Part[]>('/band/parts', {
		method: 'GET',
	})

	if (
		res.status === StatusCode.OK &&
		Array.isArray(res.response)
	) {
		return {
			status: res.status,
			response: res.response,
		}
	}

	return res as ApiResponse<Part[]>
}

export const searchUsersForBandAction = async (
	query?: string,
	part?: Part,
): Promise<ApiResponse<UserWithProfile[]>> => {
	const res = await apiRequest<UserWithProfile[]>('/band/search-users', {
		method: 'GET',
		searchParams: {
			query,
			part,
		},
		cache: 'no-store',
	})

	if (
		res.status === StatusCode.OK &&
		Array.isArray(res.response)
	) {
		return {
			status: res.status,
			response: res.response.map(mapUserWithProfile),
		}
	}

	return res as ApiResponse<UserWithProfile[]>
}
