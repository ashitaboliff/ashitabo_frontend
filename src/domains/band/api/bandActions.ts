import type {
	AddBandMemberResponse,
	BandDetails,
	CreateBandResponse,
	RemoveBandMemberResponse,
	UpdateBandMemberResponse,
	UpdateBandResponse,
	UserWithProfile,
} from '@/domains/band/model/bandTypes'
import type { Part } from '@/domains/user/model/userTypes'
import { apiDelete, apiGet, apiPost, apiPut } from '@/shared/lib/api/crud'
import {
	createdResponse,
	noContentResponse,
	okResponse,
	withFallbackMessage,
} from '@/shared/lib/api/helper'
import { getGenericStatusMessage } from '@/shared/lib/error'
import { type ApiResponse, StatusCode } from '@/types/response'

/**
 * バンド作成のエラーメッセージを生成
 */
const getCreateBandErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.BAD_REQUEST:
			return 'バンド名を入力してください。'
		case StatusCode.CONFLICT:
			return '同じ名前のバンドが既に存在します。別の名前を使用してください。'
		default:
			return getGenericStatusMessage(status)
	}
}

/**
 * バンド更新のエラーメッセージを生成
 */
const getUpdateBandErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.BAD_REQUEST:
			return 'バンド名を入力してください。'
		case StatusCode.NOT_FOUND:
			return 'バンドが見つかりませんでした。既に削除されている可能性があります。'
		case StatusCode.FORBIDDEN:
			return 'このバンドを編集する権限がありません。'
		case StatusCode.CONFLICT:
			return '同じ名前のバンドが既に存在します。別の名前を使用してください。'
		default:
			return getGenericStatusMessage(status)
	}
}

/**
 * バンド削除のエラーメッセージを生成
 */
const getDeleteBandErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.NOT_FOUND:
			return 'バンドが見つかりませんでした。既に削除されている可能性があります。'
		case StatusCode.FORBIDDEN:
			return 'このバンドを削除する権限がありません。'
		default:
			return getGenericStatusMessage(status)
	}
}

/**
 * メンバー追加のエラーメッセージを生成
 */
const getAddMemberErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.BAD_REQUEST:
			return 'ユーザーとパートを選択してください。'
		case StatusCode.NOT_FOUND:
			return 'バンドまたはユーザーが見つかりませんでした。'
		case StatusCode.CONFLICT:
			return 'このユーザーは既にメンバーです。'
		case StatusCode.FORBIDDEN:
			return 'メンバーを追加する権限がありません。'
		default:
			return getGenericStatusMessage(status)
	}
}

/**
 * メンバー削除のエラーメッセージを生成
 */
const getRemoveMemberErrorMessage = (status: number): string => {
	switch (status) {
		case StatusCode.NOT_FOUND:
			return 'メンバーが見つかりませんでした。'
		case StatusCode.FORBIDDEN:
			return 'メンバーを削除する権限がありません。'
		default:
			return getGenericStatusMessage(status)
	}
}

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
		return {
			...res,
			message: getCreateBandErrorMessage(res.status),
		}
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
		return {
			...res,
			message: getUpdateBandErrorMessage(res.status),
		}
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
		return {
			...res,
			message: getDeleteBandErrorMessage(res.status),
		}
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
		return {
			...res,
			message: getAddMemberErrorMessage(res.status),
		}
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
		return {
			...res,
			message: getRemoveMemberErrorMessage(res.status),
		}
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
