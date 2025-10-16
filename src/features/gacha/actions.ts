import {
	mapRawGacha,
	mapRawGachaList,
	type RawGachaData,
} from '@/features/gacha/services/gachaTransforms'
import type { GachaData, GachaSort, RarityType } from '@/features/gacha/types'
import { apiGet, apiPost } from '@/lib/api/crud'
import {
	createdResponse,
	mapSuccess,
	okResponse,
	withFallbackMessage,
} from '@/lib/api/helper'
import { getImageUrl } from '@/lib/r2'
import type { ApiResponse } from '@/types/responseTypes'

export const getGachaByUserIdAction = async ({
	userId,
	page,
	perPage,
	sort,
}: {
	userId: string
	page: number
	perPage: number
	sort: GachaSort
}): Promise<ApiResponse<{ gacha: GachaData[]; totalCount: number }>> => {
	const res = await apiGet<{
		gacha: RawGachaData[]
		totalCount: number
	}>(`/gacha/users/${userId}`, {
		searchParams: {
			page,
			perPage,
			sort,
		},
		next: { revalidate: 30, tags: ['gacha-user', userId] },
	})

	return mapSuccess(
		res,
		(data) => ({
			gacha: mapRawGachaList(data.gacha),
			totalCount: data.totalCount ?? 0,
		}),
		'ガチャ情報の取得に失敗しました。',
	)
}

export const getGachaByGachaSrcAction = async ({
	userId,
	gachaSrc,
}: {
	userId: string
	gachaSrc: string
}): Promise<ApiResponse<{ gacha: GachaData | null; totalCount: number }>> => {
	const res = await apiGet<{
		gacha: RawGachaData | null
		totalCount: number
	}>(`/gacha/users/${userId}/by-src`, {
		searchParams: {
			gachaSrc,
		},
		next: { revalidate: 60, tags: ['gacha-user', userId, gachaSrc] },
	})

	return mapSuccess(
		res,
		(data) => ({
			gacha: data.gacha ? mapRawGacha(data.gacha) : null,
			totalCount: data.totalCount ?? 0,
		}),
		'ガチャ情報の取得に失敗しました。',
	)
}

export const createUserGachaResultAction = async ({
	userId,
	gachaVersion,
	gachaRarity,
	gachaSrc,
	ignorePlayCountLimit,
	currentPlayCount,
}: {
	userId: string
	gachaVersion: string
	gachaRarity: RarityType
	gachaSrc: string
	ignorePlayCountLimit?: boolean
	currentPlayCount?: number
}): Promise<ApiResponse<string>> => {
	const res = await apiPost<unknown>(`/gacha/users/${userId}`, {
		body: {
			userId,
			gachaVersion,
			gachaRarity,
			gachaSrc,
			ignoreLimit: ignorePlayCountLimit ?? false,
			currentPlayCount,
		},
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'ガチャ記録の保存に失敗しました。')
	}

	return createdResponse('created')
}

export const getSignedUrlForGachaImageAction = async ({
	r2Key,
}: {
	userId: string
	r2Key: string
}): Promise<ApiResponse<string>> => {
	return okResponse(getImageUrl(r2Key))
}
