'use server'

import { revalidateTag } from 'next/cache'
import {
	getCreatePadlockErrorMessage,
	getDeletePadlockErrorMessage,
	getDeleteUserErrorMessage,
	getUpdateUserRoleErrorMessage,
} from '@/domains/admin/api/adminErrorMessages'
import {
	mapRawPadLocks,
	mapRawUserDetails,
	type RawPadLock,
	type RawUserDetail,
} from '@/domains/admin/api/dto'
import type { AdminUserSort, PadLock } from '@/domains/admin/model/adminTypes'
import type { AccountRole, UserDetail } from '@/domains/user/model/userTypes'
import { apiDelete, apiGet, apiPost, apiPut } from '@/shared/lib/api/crud'
import {
	createdResponse,
	mapSuccess,
	noContentResponse,
	okResponse,
} from '@/shared/lib/api/helper'
import { type ApiResponse, StatusCode } from '@/types/response'

export const getAllPadLocksAction = async (): Promise<
	ApiResponse<PadLock[]>
> => {
	const res = await apiGet<RawPadLock[]>('/admin/padlocks', {
		next: { revalidate: 6 * 30 * 24 * 60 * 60, tags: ['padlocks'] },
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
	sort: AdminUserSort
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
			revalidate: 7 * 24 * 60 * 60,
			tags: ['users'],
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
		return {
			...res,
			message: getDeleteUserErrorMessage(res.status),
		}
	}

	revalidateTag('users', 'max')

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
		return {
			...res,
			message: getUpdateUserRoleErrorMessage(res.status),
		}
	}

	if (res.status === StatusCode.NO_CONTENT) {
		return noContentResponse()
	}

	revalidateTag('users', 'max')

	return okResponse(null)
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
		return {
			...res,
			message: getCreatePadlockErrorMessage(res.status),
		}
	}

	revalidateTag('padlocks', 'max')

	return createdResponse('created')
}

export const deletePadLockAction = async ({
	id,
}: {
	id: string
}): Promise<ApiResponse<null>> => {
	const res = await apiDelete<null>(`/admin/padlocks/${id}`)

	if (!res.ok) {
		return {
			...res,
			message: getDeletePadlockErrorMessage(res.status),
		}
	}

	revalidateTag('padlocks', 'max')

	return noContentResponse()
}
