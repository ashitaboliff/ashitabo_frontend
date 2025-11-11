'use server'

import { revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import {
	getAuthBookingErrorMessage,
	getCreateBookingErrorMessage,
	getDeleteBookingErrorMessage,
	getUpdateBookingErrorMessage,
} from '@/domains/booking/api/bookingErrorMessages'
import { revalidateBookingCalendarsForDate } from '@/domains/booking/api/bookingRevalidate'
import {
	mapRawBooking,
	mapRawBookingList,
	mapRawBookingResponse,
	type RawBookingData,
	type RawBookingResponse,
} from '@/domains/booking/api/dto'
import { BOOKING_CALENDAR_TAG } from '@/domains/booking/constants/bookingConstants'
import type {
	Booking,
	BookingResponse,
} from '@/domains/booking/model/bookingTypes'
import { buildBookingCalendarTag } from '@/domains/booking/utils/calendarCache'
import { apiDelete, apiGet, apiPost, apiPut } from '@/shared/lib/api/crud'
import {
	createdResponse,
	failure,
	mapSuccess,
	noContentResponse,
	okResponse,
} from '@/shared/lib/api/helper'
import { toDateKey } from '@/shared/utils'
import { type ApiResponse, StatusCode } from '@/types/response'

type BookingPayload = {
	bookingDate: string
	bookingTime: number
	registName: string
	name: string
	isDeleted?: boolean
}

export const getBookingByDateAction = async ({
	startDate,
	endDate,
}: {
	startDate: string
	endDate: string
}): Promise<ApiResponse<BookingResponse>> => {
	const res = await apiGet<RawBookingResponse>('/booking', {
		searchParams: {
			start: startDate,
			end: endDate,
		},
		next: {
			revalidate: 60 * 60,
			tags: [BOOKING_CALENDAR_TAG, buildBookingCalendarTag(startDate, endDate)],
		},
	})

	return mapSuccess(
		res,
		mapRawBookingResponse,
		'予約一覧の取得に失敗しました。',
	)
}

export const getAllBookingAction = async (): Promise<
	ApiResponse<Booking[]>
> => {
	const res = await apiGet<RawBookingData[]>('/booking/logs', {
		next: { revalidate: 60 * 60, tags: ['booking'] },
	})

	return mapSuccess(
		res,
		(data) => mapRawBookingList(data),
		'予約履歴の取得に失敗しました。',
	)
}

export const getBookingByIdAction = async (
	bookingId: string,
): Promise<ApiResponse<Booking>> => {
	const res = await apiGet<RawBookingData>(`/booking/${bookingId}`, {
		next: {
			revalidate: 7 * 24 * 60 * 60,
			tags: [`booking-detail-${bookingId}`],
		},
	})

	return mapSuccess(res, mapRawBooking, '予約詳細の取得に失敗しました。')
}

export const getBookingByUserIdAction = async ({
	userId,
	page,
	perPage,
	sort,
}: {
	userId: string
	page: number
	perPage: number
	sort: 'new' | 'old'
}): Promise<ApiResponse<{ bookings: Booking[]; totalCount: number }>> => {
	const res = await apiGet<{
		bookings: RawBookingData[]
		totalCount: number
	}>(`/booking/user/${userId}`, {
		searchParams: {
			page,
			perPage,
			sort,
		},
		next: { revalidate: 24 * 60 * 60, tags: [`booking-user-${userId}`] },
	})

	return mapSuccess(
		res,
		(data) => ({
			bookings: mapRawBookingList(data.bookings),
			totalCount: data.totalCount ?? 0,
		}),
		'ユーザーの予約一覧の取得に失敗しました。',
	)
}

export const createBookingAction = async ({
	userId,
	booking,
	password,
	today,
}: {
	userId: string
	booking: BookingPayload
	password: string
	today: string
}): Promise<ApiResponse<{ id: string }>> => {
	const bookingDateKey = toDateKey(booking.bookingDate)
	const res = await apiPost<{ id: string }>('/booking', {
		body: {
			userId,
			bookingDate: bookingDateKey,
			bookingTime: booking.bookingTime,
			registName: booking.registName,
			name: booking.name,
			password,
			today,
		},
	})

	if (!res.ok) {
		return {
			...res,
			message: getCreateBookingErrorMessage(res.status),
		}
	}

	await revalidateTag('booking', 'max')
	await revalidateTag(`booking-user-${userId}`, 'max')
	await revalidateBookingCalendarsForDate(bookingDateKey)

	return createdResponse({ id: res.data.id })
}

export const updateBookingAction = async ({
	bookingId,
	userId,
	booking,
	today,
	authToken,
}: {
	bookingId: string
	userId: string
	booking: BookingPayload
	today: string
	authToken?: string | null
}): Promise<ApiResponse<null>> => {
	const bookingDateKey = toDateKey(booking.bookingDate)
	const res = await apiPut<null>(`/booking/${bookingId}`, {
		body: {
			userId,
			bookingDate: bookingDateKey,
			bookingTime: booking.bookingTime,
			registName: booking.registName,
			name: booking.name,
			isDeleted: booking.isDeleted ?? false,
			today,
			authToken: authToken ?? undefined,
		},
	})

	if (!res.ok) {
		return {
			...res,
			message: getUpdateBookingErrorMessage(res.status),
		}
	}

	await revalidateTag('booking', 'max')
	await revalidateTag(`booking-detail-${bookingId}`, 'max')
	await revalidateTag(`booking-user-${userId}`, 'max')
	await revalidateBookingCalendarsForDate(bookingDateKey)

	return noContentResponse()
}

export const deleteBookingAction = async ({
	bookingId,
	bookingDate,
	userId,
	authToken,
}: {
	bookingId: string
	bookingDate: string
	userId: string
	authToken?: string | null
}): Promise<ApiResponse<null>> => {
	const res = await apiDelete<null>(`/booking/${bookingId}`, {
		body: {
			authToken: authToken ?? undefined,
		},
	})

	if (!res.ok) {
		return {
			...res,
			message: getDeleteBookingErrorMessage(res.status),
		}
	}

	const bookingDateKey = toDateKey(bookingDate)

	await revalidateTag('booking', 'max')
	await revalidateTag(`booking-detail-${bookingId}`, 'max')
	await revalidateTag(`booking-user-${userId}`, 'max')
	await revalidateBookingCalendarsForDate(bookingDateKey)

	const cookieStore = await cookies()
	cookieStore.set(
		'booking:flash',
		JSON.stringify({ type: 'success', message: '予約を削除しました。' }),
		{ path: '/booking', maxAge: 10, httpOnly: true },
	)

	return noContentResponse()
}

export type BookingAccessGrant = {
	token: string
	expiresAt: string
}

export const authBookingAction = async ({
	bookingId,
	userId,
	password,
}: {
	bookingId: string
	userId: string
	password: string
}): Promise<ApiResponse<BookingAccessGrant>> => {
	const res = await apiPost<BookingAccessGrant>(
		`/booking/${bookingId}/verify`,
		{
			body: { userId, password },
		},
	)

	if (!res.ok) {
		return {
			...res,
			message: getAuthBookingErrorMessage(res.status),
		}
	}

	if (!res.data || typeof res.data.token !== 'string') {
		return failure(
			StatusCode.INTERNAL_SERVER_ERROR,
			'予約操作用トークンの取得に失敗しました。時間をおいて再度お試しください。',
		)
	}

	return okResponse(res.data)
}

export const getBookingIds = async (): Promise<string[]> => {
	const response = await apiGet<string[]>('/booking/ids', {
		cache: 'no-store',
		next: { revalidate: 24 * 60 * 60, tags: ['booking'] },
	})

	if (response.ok && Array.isArray(response.data)) {
		return response.data
	}
	return []
}
