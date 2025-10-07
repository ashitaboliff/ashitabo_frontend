import { apiRequest } from '@/lib/api'
import { ApiResponse, StatusCode } from '@/types/responseTypes'
import {
	createdResponse,
	mapSuccess,
	noContentResponse,
	okResponse,
	withFallbackMessage,
} from '@/lib/api/helper'
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

export const getBandDetailsAction = async (
	bandId: string,
): Promise<ApiResponse<BandDetails>> => {
	const res = await apiRequest<BandDetails>(`/band/${bandId}`, {
		method: 'GET',
		cache: 'no-store',
		next: { tags: ['bands', `band:${bandId}`] },
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'バンド情報の取得に失敗しました。')
	}

	return okResponse(res.data)
}

export const getUserBandsAction = async (): Promise<
	ApiResponse<BandDetails[]>
> => {
	const res = await apiRequest<BandDetails[]>('/band/me', {
		method: 'GET',
		cache: 'no-store',
		next: { tags: ['band-me'] },
	})

	if (!res.ok) {
		return withFallbackMessage(res, '所属バンド一覧の取得に失敗しました。')
	}

	return okResponse(res.data)
}

export const createBandAction = async (
	formData: FormData,
): Promise<CreateBandResponse> => {
	const name = String(formData.get('name') ?? '').trim()
	const res = await apiRequest<{ id: string }>('/band', {
		method: 'POST',
		body: { name },
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'バンドの作成に失敗しました。')
	}

	if (!res.data?.id) {
		return withFallbackMessage(
			{
				ok: false,
				status: StatusCode.INTERNAL_SERVER_ERROR,
				message: '',
			},
			'作成したバンドの取得に失敗しました。',
		)
	}

	const details = await getBandDetailsAction(res.data.id)
	if (!details.ok) {
		return details
	}

	return createdResponse(details.data)
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

	if (!res.ok) {
		return withFallbackMessage(res, 'バンドの更新に失敗しました。')
	}

	if (res.status === StatusCode.NO_CONTENT) {
		return getBandDetailsAction(bandId)
	}

	const details = await getBandDetailsAction(bandId)
	if (!details.ok) {
		return details
	}

	return okResponse(details.data)
}

export const deleteBandAction = async (
	bandId: string,
): Promise<ApiResponse<null>> => {
	const res = await apiRequest<null>(`/band/${bandId}`, {
		method: 'DELETE',
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'バンドの削除に失敗しました。')
	}

	return noContentResponse()
}

export const addBandMemberAction = async (
	bandId: string,
	userId: string,
	part: Part,
): Promise<AddBandMemberResponse> => {
	const res = await apiRequest<null>(`/band/${bandId}/members`, {
		method: 'POST',
		body: { userId, part },
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'メンバーの追加に失敗しました。')
	}

	return createdResponse(null)
}

export const updateBandMemberAction = async (
	bandMemberId: string,
	part: Part,
): Promise<UpdateBandMemberResponse> => {
	const res = await apiRequest<null>(`/band/members/${bandMemberId}`, {
		method: 'PUT',
		body: { part },
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'メンバーの更新に失敗しました。')
	}

	return okResponse(null)
}

export const removeBandMemberAction = async (
	bandMemberId: string,
): Promise<RemoveBandMemberResponse> => {
	const res = await apiRequest<null>(`/band/members/${bandMemberId}`, {
		method: 'DELETE',
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'メンバーの削除に失敗しました。')
	}

	return noContentResponse()
}

export const getAvailablePartsAction = async (): Promise<
	ApiResponse<Part[]>
> => {
	const res = await apiRequest<Part[]>('/band/parts', {
		method: 'GET',
		cache: 'force-cache',
		next: { revalidate: 86400, tags: ['band-parts'] },
	})

	return mapSuccess(
		res,
		(payload) => payload ?? [],
		'パート一覧の取得に失敗しました。',
	)
}

export const searchUsersForBandAction = async (
	query?: string,
	part?: Part,
): Promise<ApiResponse<UserWithProfile[]>> => {
	const res = await apiRequest<UserWithProfile[]>('/band/search-users', {
		method: 'GET',
		searchParams: { query, part },
		cache: 'no-store',
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'ユーザーの検索に失敗しました。')
	}

	return okResponse(res.data)
}
