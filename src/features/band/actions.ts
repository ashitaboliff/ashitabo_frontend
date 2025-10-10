import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api/crud'
import { ApiResponse, StatusCode } from '@/types/responseTypes'
import {
	createdResponse,
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
	const res = await apiGet<BandDetails>(`/band/${bandId}`, {
		next: { revalidate: 60, tags: ['bands', `band:${bandId}`] },
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'バンド情報の取得に失敗しました。')
	}

	return okResponse(res.data)
}

export const getUserBandsAction = async (): Promise<
	ApiResponse<BandDetails[]>
> => {
	const res = await apiGet<BandDetails[]>('/band/me', {
		next: { revalidate: 30, tags: ['band-me'] },
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
	const res = await apiPost<{ id: string }>('/band', {
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
	const res = await apiPut<UpdateBandResponse>(`/band/${bandId}`, {
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
	const res = await apiDelete<null>(`/band/${bandId}`)

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
	const res = await apiPost<null>(`/band/${bandId}/members`, {
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
	const res = await apiPut<null>(`/band/members/${bandMemberId}`, {
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
	const res = await apiDelete<null>(`/band/members/${bandMemberId}`)

	if (!res.ok) {
		return withFallbackMessage(res, 'メンバーの削除に失敗しました。')
	}

	return noContentResponse()
}

export const getAvailablePartsAction = async (): Promise<
	ApiResponse<Part[]>
> => {
	const res = await apiGet<Part[]>('/band/parts', {
		cache: 'force-cache',
		next: { revalidate: 86400, tags: ['band-parts'] },
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'パート一覧の取得に失敗しました。')
	}

	return okResponse(res.data)
}

export const searchUsersForBandAction = async (
	query?: string,
	part?: Part,
): Promise<ApiResponse<UserWithProfile[]>> => {
	const res = await apiGet<UserWithProfile[]>('/band/search-users', {
		searchParams: { query, part },
		next: { revalidate: 30, tags: ['band-search-users'] },
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'ユーザーの検索に失敗しました。')
	}

	return okResponse(res.data)
}
