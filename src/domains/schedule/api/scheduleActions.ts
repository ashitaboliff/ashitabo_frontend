import {
	mapRawSchedule,
	mapRawUserWithNames,
	type RawSchedule,
	type RawUserWithName,
} from '@/domains/schedule/api/dto'
import type {
	Schedule,
	UserWithName,
} from '@/domains/schedule/model/scheduleTypes'
import { apiGet, apiPost } from '@/shared/lib/api/crud'
import {
	createdResponse,
	mapSuccess,
	withFallbackMessage,
} from '@/shared/lib/api/helper'
import { type ApiResponse, StatusCode } from '@/types/response'

export const getScheduleByIdAction = async (
	scheduleId: string,
): Promise<ApiResponse<Schedule>> => {
	const res = await apiGet<RawSchedule>(`/schedule/${scheduleId}`, {
		next: {
			revalidate: 60,
			tags: ['schedules', `schedule:${scheduleId}`],
		},
	})

	return mapSuccess(res, mapRawSchedule, '日程調整の取得に失敗しました。')
}

export const getUserIdWithNames = async (): Promise<
	ApiResponse<UserWithName[]>
> => {
	const res = await apiGet<RawUserWithName[]>('/schedule/users', {
		cache: 'force-cache',
		next: { revalidate: 300, tags: ['schedule-users'] },
	})

	return mapSuccess(
		res,
		mapRawUserWithNames,
		'ユーザー一覧の取得に失敗しました。',
	)
}

export const createScheduleAction = async ({
	id,
	userId,
	title,
	description,
	dates,
	mention,
	timeExtended,
	deadline,
}: {
	id: string
	userId: string
	title: string
	description?: string | null
	dates: string[]
	mention: string[]
	timeExtended: boolean
	deadline: string
}): Promise<ApiResponse<Schedule>> => {
	const res = await apiPost<{ id: string } | RawSchedule>('/schedule', {
		body: {
			id,
			userId,
			title,
			description,
			dates,
			mention,
			timeExtended,
			deadline,
		},
	})

	if (!res.ok) {
		return withFallbackMessage(res, '日程調整の作成に失敗しました。')
	}

	const createdId =
		res.status === StatusCode.CREATED &&
		typeof res.data === 'object' &&
		res.data !== null &&
		'id' in res.data
			? ((res.data.id as string | undefined) ?? id)
			: id

	const detail = await getScheduleByIdAction(createdId)
	if (!detail.ok) {
		return detail
	}

	return createdResponse(detail.data)
}
