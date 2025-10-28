'use server'

import { revalidateTag } from 'next/cache'
import {
	mapRawGacha,
	mapRawGachaList,
	type RawGachaData,
} from '@/domains/gacha/api/dto'
import type {
	GachaData,
	GachaSort,
	RarityType,
} from '@/domains/gacha/model/gachaTypes'
import { apiGet, apiPost } from '@/shared/lib/api/crud'
import {
	createdResponse,
	failure,
	mapSuccess,
	okResponse,
	withFallbackMessage,
} from '@/shared/lib/api/helper'
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
		next: { revalidate: 60 * 60, tags: [`gacha-user-${userId}`] },
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
		next: { revalidate: 60 * 60, tags: [`gacha-id-${userId}-${gachaSrc}`] },
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

	revalidateTag(`gacha-user-${userId}`, 'max')
	revalidateTag(`gacha-id-${userId}-${gachaSrc}`, 'max')

	return createdResponse('created')
}

export const getSignedUrlForGachaImageAction = async ({
	r2Key,
}: {
	r2Key: string
}): Promise<ApiResponse<string>> => {
	const res = await apiPost<{ urls: Record<string, string> }>(
		'/gacha/images/proxy',
		{
			body: { keys: [r2Key] },
		},
	)
	if (!res.ok) {
		return withFallbackMessage(res, '画像URLの生成に失敗しました。')
	}
	const url = res.data.urls[r2Key]
	if (!url) {
		return failure(404, '画像URLの生成に失敗しました。')
	}
	return okResponse(url)
}

export const getSignedUrlsForGachaImagesAction = async ({
	r2Keys,
}: {
	r2Keys: string[]
}): Promise<ApiResponse<Record<string, string>>> => {
	const uniqueKeys = Array.from(new Set(r2Keys.filter(Boolean)))
	if (uniqueKeys.length === 0) {
		return okResponse({})
	}
	const res = await apiPost<{ urls: Record<string, string> }>(
		'/gacha/images/proxy',
		{
			body: { keys: uniqueKeys },
		},
	)
	if (!res.ok) {
		return withFallbackMessage(res, '画像URLの生成に失敗しました。')
	}
	const payload: Record<string, string> = {}
	for (const key of uniqueKeys) {
		const value = res.data.urls[key]
		if (value) {
			payload[key] = value
		}
	}
	return okResponse(payload)
}
