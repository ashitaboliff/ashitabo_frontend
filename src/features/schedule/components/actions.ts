import { apiRequest } from '@/lib/api'
import { ApiResponse, StatusCode } from '@/types/responseTypes'
import { Schedule, UserWithName } from '@/features/schedule/types'

const mapSchedule = (input: any): Schedule => ({
	id: input.id,
	userId: input.userId,
	title: input.title,
	description: input.description ?? null,
	startDate: input.startDate,
	endDate: input.endDate,
	mention: (input.mention as string[]) ?? [],
	timeExtended: input.timeExtended ?? false,
	deadline: input.deadline,
	createdAt: input.createdAt ? new Date(input.createdAt) : undefined,
	updatedAt: input.updatedAt ? new Date(input.updatedAt) : undefined,
})

export const getScheduleByIdAction = async (
	scheduleId: string,
): Promise<ApiResponse<Schedule>> => {
	const res = await apiRequest<Schedule>(`/schedule/${scheduleId}`, {
		method: 'GET',
		cache: 'no-store',
	})

	if (
		res.status === StatusCode.OK &&
		typeof res.response !== 'string'
	) {
		return {
			status: res.status,
			response: mapSchedule(res.response),
		}
	}

	return res
}

export const getUserIdWithNames = async (): Promise<
	ApiResponse<UserWithName[]>
> => {
	const res = await apiRequest<UserWithName[]>('/schedule/users', {
		method: 'GET',
		cache: 'default',
	})

	if (
		res.status === StatusCode.OK &&
		Array.isArray(res.response)
	) {
		return {
			status: res.status,
			response: res.response.map((user) => ({
				id: user.id,
				name: user.name,
				image: (user as any).image ?? null,
			})),
		}
	}

	return res
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
	const res = await apiRequest<{ id: string } | Schedule>('/schedule', {
		method: 'POST',
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

	if (res.status === StatusCode.CREATED) {
		const scheduleId =
			typeof res.response === 'object' && res.response
				? (res.response as any).id ?? id
				: id
		const detail = await getScheduleByIdAction(scheduleId)
		if (
			detail.status === StatusCode.OK &&
			detail.response &&
			typeof detail.response !== 'string'
		) {
			return {
				status: StatusCode.CREATED,
				response: detail.response,
			}
		}
		return detail
	}

	return {
		status: res.status as StatusCode,
		response:
			typeof res.response === 'string'
				? res.response
				: '日程調整の作成に失敗しました。',
	} as ApiResponse<Schedule>
}
