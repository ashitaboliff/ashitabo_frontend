import { apiRequest } from '@/lib/api'
import { ApiResponse, StatusCode } from '@/types/responseTypes'
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

	if (
		res.status === StatusCode.OK &&
		typeof res.response !== 'string'
	) {
		return {
			status: res.status,
			response: {
				gacha: res.response.gacha.map(mapGacha),
				totalCount: res.response.totalCount,
			},
		}
	}

	return res
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

	if (
		res.status === StatusCode.OK &&
		typeof res.response !== 'string'
	) {
		return {
			status: res.status,
			response: {
				gacha: res.response.gacha ? mapGacha(res.response.gacha) : null,
				totalCount: res.response.totalCount,
			},
		}
	}

	return res
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
	const res = await apiRequest(`/gacha/users/${userId}`, {
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

	if (res.status === StatusCode.CREATED) {
		return {
			status: StatusCode.CREATED,
			response: 'created',
		}
	}

	const message =
		typeof res.response === 'string'
			? res.response
			: 'ガチャ記録の保存に失敗しました'

	return {
		status: res.status as StatusCode,
		response: message,
	} as ApiResponse<string>
}

export const getSignedUrlForGachaImageAction = async ({
	r2Key,
}: {
	userId: string
	r2Key: string
}): Promise<ApiResponse<string>> => {
	return {
		status: StatusCode.OK,
		response: getImageUrl(r2Key),
	}
}
