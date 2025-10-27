'use server'

import { revalidateTag } from 'next/cache'
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
	withFallbackMessage,
} from '@/shared/lib/api/helper'
import { type ApiResponse, StatusCode } from '@/types/responseTypes'

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
		return withFallbackMessage(res, 'ユーザー削除に失敗しました')
	}

	revalidateTag('users')

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

	revalidateTag('users')

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
		return withFallbackMessage(res, '部室パスワードの作成に失敗しました')
	}

	revalidateTag('padlocks')

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

	revalidateTag('padlocks')

	return noContentResponse()
}
