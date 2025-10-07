import { apiRequest } from '@/lib/api'
import { ApiResponse, StatusCode } from '@/types/responseTypes'
import {
	createdResponse,
	mapSuccess,
	okResponse,
	withFallbackMessage,
} from '@/lib/api/helper'
import { GachaData, GachaSort, RarityType } from '@/features/gacha/types'
import { getImageUrl } from '@/lib/r2'

const mapGacha = (input: any): GachaData => ({
	userId: input.userId,
	id: input.id,
	gachaVersion: input.gachaVersion,
	gachaRarity: input.gachaRarity as RarityType,
	gachaSrc: input.gachaSrc,
	signedGachaSrc: input.signedGachaSrc ?? getImageUrl(input.gachaSrc),
	createdAt: new Date(input.createdAt),
	updatedAt: new Date(input.updatedAt),
	isDeleted: input.isDeleted ?? false,
})

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
		gacha: any[]
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

	return mapSuccess(
		res,
		(payload) => ({
			gacha: ((payload?.gacha ?? []) as any[]).map(mapGacha),
			totalCount: payload?.totalCount ?? 0,
		}),
		'ガチャ履歴の取得に失敗しました。',
	)
}

export const getGachaByGachaSrcAction = async ({
	userId,
	gachaSrc,
}: {
	userId: string
	gachaSrc: string
}): Promise<ApiResponse<{ gacha: GachaData | null; totalCount: number }>> => {
	const res = await apiRequest<{
		gacha: any | null
		totalCount: number
	}>(`/gacha/users/${userId}/by-src`, {
		method: 'GET',
		searchParams: {
			gachaSrc,
		},
		cache: 'no-store',
	})

	return mapSuccess(
		res,
		(payload) => ({
			gacha: payload?.gacha ? mapGacha(payload.gacha) : null,
			totalCount: payload?.totalCount ?? 0,
		}),
		'ガチャ詳細の取得に失敗しました。',
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
