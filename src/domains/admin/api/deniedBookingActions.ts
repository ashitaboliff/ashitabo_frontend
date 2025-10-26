'use server'

import { eachDayOfInterval, getDay } from 'date-fns'
import { revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import {
	mapRawDeniedBookings,
	type RawDeniedBooking,
} from '@/domains/admin/api/dto'
import type {
	DeniedBookingFormValues,
	DeniedBookingSort,
} from '@/domains/admin/model/adminTypes'
import type { DeniedBooking } from '@/domains/booking/model/bookingTypes'
import { apiDelete, apiGet, apiPost } from '@/shared/lib/api/crud'
import {
	createdResponse,
	failure,
	mapSuccess,
	noContentResponse,
	withFallbackMessage,
} from '@/shared/lib/api/helper'
import { toDateKey } from '@/shared/utils'
import { type ApiResponse, StatusCode } from '@/types/responseTypes'

type CreateDeniedBookingRequestBody = {
	startDate: string | string[]
	startTime: number
	endTime?: number
	description: string
}

const buildDeniedBookingRequestBody = (
	values: DeniedBookingFormValues,
):
	| { success: true; payload: CreateDeniedBookingRequestBody }
	| { success: false; error: ReturnType<typeof failure> } => {
	const startTime = Number(values.startTime)
	if (!Number.isFinite(startTime)) {
		return {
			success: false,
			error: failure(StatusCode.BAD_REQUEST, '開始時間が不正です。'),
		}
	}

	if (!(values.startDate instanceof Date)) {
		return {
			success: false,
			error: failure(StatusCode.BAD_REQUEST, '開始日を入力してください。'),
		}
	}

	if (values.type === 'single') {
		return {
			success: true,
			payload: {
				startDate: toDateKey(values.startDate),
				startTime,
				description: values.description,
			},
		}
	}

	const parsedEndTime = Number(values.endTime)
	if (!Number.isFinite(parsedEndTime)) {
		return {
			success: false,
			error: failure(StatusCode.BAD_REQUEST, '終了時間が不正です。'),
		}
	}

	if (values.type === 'period') {
		return {
			success: true,
			payload: {
				startDate: toDateKey(values.startDate),
				startTime,
				endTime: parsedEndTime,
				description: values.description,
			},
		}
	}

	if (!(values.endDate instanceof Date)) {
		return {
			success: false,
			error: failure(StatusCode.BAD_REQUEST, '終了日を入力してください。'),
		}
	}

	if (values.dayOfWeek === undefined) {
		return {
			success: false,
			error: failure(StatusCode.BAD_REQUEST, '曜日を選択してください。'),
		}
	}

	const targetDay = Number(values.dayOfWeek)
	if (!Number.isInteger(targetDay) || targetDay < 0 || targetDay > 6) {
		return {
			success: false,
			error: failure(StatusCode.BAD_REQUEST, '曜日の値が不正です。'),
		}
	}

	const allDates = eachDayOfInterval({
		start: values.startDate,
		end: values.endDate,
	})

	const dates = allDates
		.filter((date) => getDay(date) === targetDay)
		.map((date) => toDateKey(date))

	if (dates.length === 0) {
		return {
			success: false,
			error: failure(
				StatusCode.BAD_REQUEST,
				'選択された期間に該当する曜日がありません。',
			),
		}
	}

	return {
		success: true,
		payload: {
			startDate: dates,
			startTime,
			endTime: parsedEndTime,
			description: values.description,
		},
	}
}

export const createDeniedBookingAction = async (
	values: DeniedBookingFormValues,
): Promise<ApiResponse<string>> => {
	const request = buildDeniedBookingRequestBody(values)
	console.log(request)
	if (!request.success) {
		return request.error
	}

	const res = await apiPost<unknown>('/admin/booking/denials', {
		body: request.payload,
	})

	if (!res.ok) {
		return withFallbackMessage(res, '予約禁止日の作成に失敗しました')
	}

	revalidateTag('denied-bookings')

	const cookieStore = await cookies()
	cookieStore.set(
		'admin/denied:flash',
		JSON.stringify({ type: 'success', message: '予約禁止日を作成しました。' }),
		{ path: '/admin/denied', maxAge: 10, httpOnly: true },
	)

	return createdResponse('created')
}

export const getDeniedBookingAction = async ({
	page,
	perPage,
	sort,
	today,
}: {
	page: number
	perPage: number
	sort: DeniedBookingSort
	today: string
}): Promise<ApiResponse<{ data: DeniedBooking[]; totalCount: number }>> => {
	const res = await apiGet<{
		data: RawDeniedBooking[]
		totalCount: number
	}>('/admin/booking/denials', {
		searchParams: {
			page,
			perPage,
			sort,
			today,
		},
		next: {
			revalidate: 7 * 24 * 60 * 60,
			tags: [
				`denied-bookings-${page}-${perPage}-${sort}-${today}`,
				'denied-bookings',
			],
		},
	})

	return mapSuccess(
		res,
		(data) => ({
			data: mapRawDeniedBookings(data.data),
			totalCount: data.totalCount ?? 0,
		}),
		'予約禁止日の取得に失敗しました',
	)
}

export const deleteDeniedBookingAction = async ({
	id,
}: {
	id: string
}): Promise<ApiResponse<null>> => {
	const res = await apiDelete<null>(`/admin/booking/denials/${id}`)

	if (!res.ok) {
		return withFallbackMessage(res, '予約禁止日の削除に失敗しました')
	}

	revalidateTag('denied-bookings')

	return noContentResponse()
}
