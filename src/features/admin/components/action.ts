import { apiRequest } from '@/lib/api'
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
	const res = await apiRequest<PadLock[]>('/admin/padlocks', {
		method: 'GET',
		cache: 'no-store',
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
	const res = await apiRequest<{
		users: UserDetail[]
		totalCount: number
	}>('/admin/users', {
		method: 'GET',
		searchParams: {
			page,
			perPage,
			sort,
		},
		cache: 'no-store',
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
	const res = await apiRequest<null>(`/admin/users/${id}`, {
		method: 'DELETE',
	})

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
	const res = await apiRequest<null>(`/admin/users/${id}/role`, {
		method: 'PUT',
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
	const res = await apiRequest<unknown>('/admin/booking-bans', {
		method: 'POST',
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
	const res = await apiRequest<{
		data: any[]
		totalCount: number
	}>('/admin/booking-bans', {
		method: 'GET',
		searchParams: {
			page,
			perPage,
			sort,
			today,
		},
		cache: 'no-store',
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
	const res = await apiRequest<null>(`/admin/booking-bans/${id}`, {
		method: 'DELETE',
	})

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
	const res = await apiRequest<unknown>('/admin/padlocks', {
		method: 'POST',
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
	const res = await apiRequest<null>(`/admin/padlocks/${id}`, {
		method: 'DELETE',
	})

	if (!res.ok) {
		return withFallbackMessage(res, '部室パスワードの削除に失敗しました')
	}

	return noContentResponse()
}
