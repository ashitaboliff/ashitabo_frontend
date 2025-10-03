import { apiRequest } from '@/lib/api'
import { ApiResponse, StatusCode } from '@/types/responseTypes'
import { UserDetail, AccountRole } from '@/features/user/types'
import { BanBooking } from '@/features/booking/types'
import { PadLock } from '@/features/admin/types'

const mapUserDetail = (input: any): UserDetail => ({
	id: input.id,
	name: input.name ?? null,
	fullName: input.fullName ?? undefined,
	studentId: input.studentId ?? undefined,
	expected: input.expected ?? undefined,
	image: input.image ?? null,
	createAt: input.createdAt ? new Date(input.createdAt) : new Date(),
	updateAt: input.updatedAt ? new Date(input.updatedAt) : new Date(),
	AccountRole: input.accountRole ?? null,
	role: input.role ?? undefined,
	part: input.part ?? undefined,
})

const mapBanBooking = (input: any): BanBooking => ({
	id: input.id,
	startDate: new Date(input.startDate),
	startTime: input.startTime,
	endTime: input.endTime ?? null,
	description: input.description,
	createdAt: new Date(input.createdAt),
	updatedAt: new Date(input.updatedAt),
	isDeleted: input.isDeleted ?? false,
})

const mapPadLock = (input: any): PadLock => ({
	id: input.id,
	name: input.name,
	createdAt: new Date(input.createdAt),
	updatedAt: new Date(input.updatedAt),
	isDeleted: input.isDeleted ?? false,
})

export const getAllPadLocksAction = async (): Promise<
	ApiResponse<PadLock[]>
> => {
	const res = await apiRequest<PadLock[]>('/admin/padlocks', {
		method: 'GET',
		cache: 'no-store',
	})

	if (
		res.status === StatusCode.OK &&
		Array.isArray(res.response)
	) {
		return {
			status: res.status,
			response: res.response.map(mapPadLock),
		}
	}

	return res as ApiResponse<PadLock[]>
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
		users: any[]
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

	if (
		res.status === StatusCode.OK &&
		typeof res.response !== 'string'
	) {
		return {
			status: res.status,
			response: {
				users: res.response.users.map(mapUserDetail),
				totalCount: res.response.totalCount,
			},
		}
	}

	return res
}

export const deleteUserAction = async ({
	id,
}: {
	id: string
}): Promise<ApiResponse<null>> => {
	const res = await apiRequest(`/admin/users/${id}`, {
		method: 'DELETE',
	})

	if (res.status === StatusCode.NO_CONTENT) {
		return { status: StatusCode.OK, response: null }
	}

	return {
		status: res.status as StatusCode,
		response:
			typeof res.response === 'string'
				? res.response
				: 'ユーザー削除に失敗しました',
	} as ApiResponse<null>
}

export const updateUserRoleAction = async ({
	id,
	role,
}: {
	id: string
	role: AccountRole
}): Promise<ApiResponse<null>> => {
	const res = await apiRequest(`/admin/users/${id}/role`, {
		method: 'PUT',
		body: { role },
	})

	if (res.status === StatusCode.NO_CONTENT) {
		return { status: StatusCode.OK, response: null }
	}

	return {
		status: res.status as StatusCode,
		response:
			typeof res.response === 'string'
				? res.response
				: 'ユーザー権限の更新に失敗しました',
	} as ApiResponse<null>
}

export const adminRevalidateTagAction = async (
	tag: string,
): Promise<ApiResponse<null>> => {
	console.info(`Revalidate tag placeholder invoked for ${tag}`)
	return { status: StatusCode.OK, response: null }
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
	const res = await apiRequest('/admin/booking-bans', {
		method: 'POST',
		body: {
			startDate,
			startTime,
			endTime,
			description,
		},
	})

	if (res.status === StatusCode.CREATED) {
		return { status: StatusCode.CREATED, response: 'created' }
	}

	return {
		status: res.status as StatusCode,
		response:
			typeof res.response === 'string'
				? res.response
				: '予約禁止日の作成に失敗しました',
	} as ApiResponse<string>
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

	if (
		res.status === StatusCode.OK &&
		typeof res.response !== 'string'
	) {
		return {
			status: res.status,
			response: {
				data: res.response.data.map(mapBanBooking),
				totalCount: res.response.totalCount,
			},
		}
	}

	return res
}

export const deleteBanBookingAction = async ({
	id,
}: {
	id: string
}): Promise<ApiResponse<null>> => {
	const res = await apiRequest(`/admin/booking-bans/${id}`, {
		method: 'DELETE',
	})

	if (res.status === StatusCode.NO_CONTENT) {
		return { status: StatusCode.OK, response: null }
	}

	return {
		status: res.status as StatusCode,
		response:
			typeof res.response === 'string'
				? res.response
				: '予約禁止日の削除に失敗しました',
	} as ApiResponse<null>
}

export const createPadLockAction = async ({
	name,
	password,
}: {
	name: string
	password: string
}): Promise<ApiResponse<string>> => {
	const res = await apiRequest('/admin/padlocks', {
		method: 'POST',
		body: { name, password },
	})

	if (res.status === StatusCode.CREATED) {
		return { status: StatusCode.CREATED, response: 'created' }
	}

	return {
		status: res.status as StatusCode,
		response:
			typeof res.response === 'string'
				? res.response
				: 'パドロックの作成に失敗しました',
	} as ApiResponse<string>
}

export const deletePadLockAction = async ({
	id,
}: {
	id: string
}): Promise<ApiResponse<null>> => {
	const res = await apiRequest(`/admin/padlocks/${id}`, {
		method: 'DELETE',
	})

	if (res.status === StatusCode.NO_CONTENT) {
		return { status: StatusCode.OK, response: null }
	}

	return {
		status: res.status as StatusCode,
		response:
			typeof res.response === 'string'
				? res.response
				: 'パドロックの削除に失敗しました',
	} as ApiResponse<null>
}
