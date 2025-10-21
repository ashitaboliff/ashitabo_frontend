import {
	mapRawBanBookings,
	mapRawPadLocks,
	mapRawUserDetails,
	type RawBanBooking,
	type RawPadLock,
	type RawUserDetail,
} from '@/domains/admin/api/dto'
import type { PadLock } from '@/domains/admin/model/adminTypes'
import type { BanBooking } from '@/domains/booking/model/bookingTypes'
import type { AccountRole, UserDetail } from '@/domains/user/model/userTypes'
import { apiDelete, apiGet, apiPost, apiPut } from '@/shared/lib/api/crud'
import {
	createdResponse,
	mapSuccess,
	noContentResponse,
	okResponse,
	withFallbackMessage,
} from '@/shared/lib/api/helper'
import { type ApiResponse, StatusCode } from '@/types/responseTypes'

export const getAllPadLocksAction = async (): Promise<
	ApiResponse<PadLock[]>
> => {
	const res = await apiGet<RawPadLock[]>('/admin/padlocks', {
		next: { revalidate: 120, tags: ['admin-padlocks'] },
	})

	return mapSuccess(
		res,
		mapRawPadLocks,
		'部室パスワード一覧の取得に失敗しました',
	)
}

export const getAllUserDetailsAction = async ({
	page,
	perPage,
	sort,
}: {
	page: number
	perPage: number
	sort: 'new' | 'old'
}): Promise<ApiResponse<{ users: UserDetail[]; totalCount: number }>> => {
	const res = await apiGet<{
		users: RawUserDetail[]
		totalCount: number
	}>('/admin/users', {
		searchParams: {
			page,
			perPage,
			sort,
		},
		next: {
			revalidate: 30,
			tags: ['admin-users'],
		},
	})

	return mapSuccess(
		res,
		(data) => ({
			users: mapRawUserDetails(data.users),
			totalCount: data.totalCount ?? 0,
		}),
		'ユーザー一覧の取得に失敗しました',
	)
}

export const deleteUserAction = async ({
	id,
}: {
	id: string
}): Promise<ApiResponse<null>> => {
	const res = await apiDelete<null>(`/admin/users/${id}`)

	if (!res.ok) {
		return withFallbackMessage(res, 'ユーザー削除に失敗しました')
	}

	return okResponse(null)
}

export const updateUserRoleAction = async ({
	id,
	role,
}: {
	id: string
	role: AccountRole
}): Promise<ApiResponse<null>> => {
	const res = await apiPut<null>(`/admin/users/${id}/role`, {
		body: { role },
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'ユーザー権限の更新に失敗しました')
	}

	if (res.status === StatusCode.NO_CONTENT) {
		return noContentResponse()
	}

	return okResponse(null)
}

export const adminRevalidateTagAction = async (
	tag: string,
): Promise<ApiResponse<null>> => {
	console.info(`Revalidate tag placeholder invoked for ${tag}`)
	return okResponse(null)
}

export const createBookingBanDateAction = async ({
	startDate,
	startTime,
	endTime,
	description,
}: {
	startDate: string | string[]
	startTime: number
	endTime?: number
	description: string
}): Promise<ApiResponse<string>> => {
	const res = await apiPost<unknown>('/admin/booking-bans', {
		body: {
			startDate,
			startTime,
			endTime,
			description,
		},
	})

	if (!res.ok) {
		return withFallbackMessage(res, '予約禁止日の作成に失敗しました')
	}

	return createdResponse('created')
}

export const getBanBookingAction = async ({
	page,
	perPage,
	sort,
	today,
}: {
	page: number
	perPage: number
	sort: 'new' | 'old' | 'relativeCurrent'
	today: string
}): Promise<ApiResponse<{ data: BanBooking[]; totalCount: number }>> => {
	const res = await apiGet<{
		data: RawBanBooking[]
		totalCount: number
	}>('/admin/booking-bans', {
		searchParams: {
			page,
			perPage,
			sort,
			today,
		},
		next: {
			revalidate: 60,
			tags: ['admin-booking-bans'],
		},
	})

	return mapSuccess(
		res,
		(data) => ({
			data: mapRawBanBookings(data.data),
			totalCount: data.totalCount ?? 0,
		}),
		'予約禁止日の取得に失敗しました',
	)
}

export const deleteBanBookingAction = async ({
	id,
}: {
	id: string
}): Promise<ApiResponse<null>> => {
	const res = await apiDelete<null>(`/admin/booking-bans/${id}`)

	if (!res.ok) {
		return withFallbackMessage(res, '予約禁止日の削除に失敗しました')
	}

	return noContentResponse()
}

export const createPadLockAction = async ({
	name,
	password,
}: {
	name: string
	password: string
}): Promise<ApiResponse<string>> => {
	const res = await apiPost<unknown>('/admin/padlocks', {
		body: { name, password },
	})

	if (!res.ok) {
		return withFallbackMessage(res, '部室パスワードの作成に失敗しました')
	}

	return createdResponse('created')
}

export const deletePadLockAction = async ({
	id,
}: {
	id: string
}): Promise<ApiResponse<null>> => {
	const res = await apiDelete<null>(`/admin/padlocks/${id}`)

	if (!res.ok) {
		return withFallbackMessage(res, '部室パスワードの削除に失敗しました')
	}

	return noContentResponse()
}
