import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api/crud'
import { ApiResponse, StatusCode } from '@/types/responseTypes'
import {
	createdResponse,
	noContentResponse,
	okResponse,
	withFallbackMessage,
} from '@/lib/api/helper'
import { UserDetail, AccountRole } from '@/features/user/types'
import { BanBooking } from '@/features/booking/types'
import { PadLock } from '@/features/admin/types'

export const getAllPadLocksAction = async (): Promise<
	ApiResponse<PadLock[]>
> => {
	const res = await apiGet<PadLock[]>('/admin/padlocks', {
		...(typeof window === 'undefined'
			? { next: { revalidate: 120, tags: ['admin-padlocks'] } }
			: {}),
	})

	if (!res.ok) {
		return withFallbackMessage(res, '部室パスワード一覧の取得に失敗しました')
	}

	return okResponse(res.data)
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
		users: UserDetail[]
		totalCount: number
	}>('/admin/users', {
		searchParams: {
			page,
			perPage,
			sort,
		},
		...(typeof window === 'undefined'
			? {
					next: {
						revalidate: 30,
						tags: ['admin-users'],
					},
				}
			: {}),
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'ユーザー一覧の取得に失敗しました')
	}

	return okResponse({
		users: res.data?.users ?? [],
		totalCount: res.data?.totalCount ?? 0,
	})
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
		data: BanBooking[]
		totalCount: number
	}>('/admin/booking-bans', {
		searchParams: {
			page,
			perPage,
			sort,
			today,
		},
		...(typeof window === 'undefined'
			? {
					next: {
						revalidate: 60,
						tags: ['admin-booking-bans'],
					},
				}
			: {}),
	})

	if (!res.ok) {
		return withFallbackMessage(res, '予約禁止日の取得に失敗しました')
	}

	return okResponse({
		data: res.data?.data ?? [],
		totalCount: res.data?.totalCount ?? 0,
	})
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
