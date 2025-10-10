import { apiGet, apiPost, apiPut } from '@/lib/api/crud'
import { ApiResponse } from '@/types/responseTypes'
import {
	createdResponse,
	okResponse,
	withFallbackMessage,
} from '@/lib/api/helper'
import { GachaData, GachaSort, RarityType } from '@/features/gacha/types'
import { getImageUrl } from '@/lib/r2'
import {
	mapRawGacha,
	mapRawGachaList,
	type RawGachaData,
} from '@/features/gacha/services/gachaTransforms'

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

	if (!res.ok) {
		return withFallbackMessage(res, 'ガチャ一覧の取得に失敗しました。')
	}

	return okResponse({
		gacha: mapRawGachaList(res.data?.gacha),
		totalCount: res.data?.totalCount ?? 0,
	})
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

	if (!res.ok) {
		return withFallbackMessage(res, 'ガチャ情報の取得に失敗しました。')
	}

	return okResponse({
		gacha: res.data?.gacha ? mapRawGacha(res.data.gacha) : null,
		totalCount: res.data?.totalCount ?? 0,
	})
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
