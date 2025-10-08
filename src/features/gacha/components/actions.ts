import { apiRequest } from '@/lib/api'
import { ApiResponse } from '@/types/responseTypes'
import {
	createdResponse,
	okResponse,
	withFallbackMessage,
} from '@/lib/api/helper'
import { GachaData, GachaSort, RarityType } from '@/features/gacha/types'
import { getImageUrl } from '@/lib/r2'

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
	const res = await apiRequest<{
		gacha: GachaData[]
		totalCount: number
	}>(`/gacha/users/${userId}`, {
		method: 'GET',
		searchParams: {
			page,
			perPage,
			sort,
		},
		cache: 'no-store',
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'ガチャ一覧の取得に失敗しました。')
	}

	return okResponse({
		gacha: res.data?.gacha,
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
	const res = await apiRequest<{
		gacha: GachaData | null
		totalCount: number
	}>(`/gacha/users/${userId}/by-src`, {
		method: 'GET',
		searchParams: {
			gachaSrc,
		},
		cache: 'no-store',
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'ガチャ情報の取得に失敗しました。')
	}

	return okResponse({
		gacha: res.data?.gacha,
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
	const res = await apiRequest<unknown>(`/gacha/users/${userId}`, {
		method: 'POST',
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
