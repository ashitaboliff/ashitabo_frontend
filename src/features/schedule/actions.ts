import { apiGet, apiPost } from '@/lib/api/crud'
import { ApiResponse, StatusCode } from '@/types/responseTypes'
import {
	createdResponse,
	mapSuccess,
	okResponse,
	withFallbackMessage,
} from '@/lib/api/helper'
import { Schedule, UserWithName } from '@/features/schedule/types'

export const getScheduleByIdAction = async (
	scheduleId: string,
): Promise<ApiResponse<Schedule>> => {
	const res = await apiGet<Schedule>(`/schedule/${scheduleId}`, {
		...(typeof window === 'undefined'
			? {
					next: {
						revalidate: 60,
						tags: ['schedules', `schedule:${scheduleId}`],
					},
				}
			: {}),
	})

	if (!res.ok) {
		return withFallbackMessage(res, '日程の取得に失敗しました。')
	}

	return okResponse(res.data)
}

export const getUserIdWithNames = async (): Promise<
	ApiResponse<UserWithName[]>
> => {
	const res = await apiGet<UserWithName[]>('/schedule/users', {
		cache: 'force-cache',
		next: { revalidate: 300, tags: ['schedule-users'] },
	})

	return mapSuccess(
		res,
		(users) =>
			(users ?? []).map((user) => ({
				id: user.id,
				name: user.name,
				image: (user as any).image ?? null,
			})),
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
	const res = await apiPost<{ id: string } | Schedule>('/schedule', {
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
