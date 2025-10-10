import { apiGet, apiPost } from '@/lib/api/crud'
import { ApiResponse, StatusCode } from '@/types/responseTypes'
import {
	createdResponse,
	okResponse,
	withFallbackMessage,
} from '@/lib/api/helper'
import { Schedule, UserWithName } from '@/features/schedule/types'
import {
	mapRawSchedule,
	mapRawUserWithNames,
	type RawSchedule,
	type RawUserWithName,
} from '@/features/schedule/services/scheduleTransforms'

export const getScheduleByIdAction = async (
	scheduleId: string,
): Promise<ApiResponse<Schedule>> => {
	const res = await apiGet<RawSchedule>(`/schedule/${scheduleId}`, {
		next: {
			revalidate: 60,
			tags: ['schedules', `schedule:${scheduleId}`],
		},
	})

	if (!res.ok) {
		return withFallbackMessage(res, '日程の取得に失敗しました。')
	}

	return okResponse(mapRawSchedule(res.data))
}

export const getUserIdWithNames = async (): Promise<
	ApiResponse<UserWithName[]>
> => {
	const res = await apiGet<RawUserWithName[]>('/schedule/users', {
		cache: 'force-cache',
		next: { revalidate: 300, tags: ['schedule-users'] },
	})

	if (!res.ok) {
		return withFallbackMessage(res, 'ユーザー一覧の取得に失敗しました。')
	}

	return okResponse(mapRawUserWithNames(res.data))
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
		res.status === StatusCode.CREATED
			? typeof res.data === 'object' && res.data
				? (res.data as any).id ?? id
				: id
			: id

	const detail = await getScheduleByIdAction(createdId)
	if (!detail.ok) {
		return detail
	}

	return createdResponse(detail.data)
}
