'use server'

import { revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import { BOOKING_CALENDAR_TAG } from '@/domains/booking/constants/bookingConstants'
import {
	mapRawBooking,
	mapRawBookingList,
	mapRawBookingLogs,
	mapRawBookingResponse,
	type RawBookingData,
	type RawBookingResponse,
} from '@/domains/booking/services/bookingService'
import type {
	Booking,
	BookingLog,
	BookingResponse,
} from '@/domains/booking/model/bookingTypes'
import { apiDelete, apiGet, apiPost, apiPut } from '@/shared/lib/api/crud'
import {
	createdResponse,
	mapSuccess,
	noContentResponse,
	okResponse,
	withFallbackMessage,
} from '@/shared/lib/api/helper'
import type { ApiResponse } from '@/types/responseTypes'
import { toDateKey } from '@/shared/utils'
import {
	buildBookingCalendarTag,
	getBookingCalendarRangesForDate,
} from '@/domains/booking/utils/calendarCache'

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
	ApiResponse<BookingLog[]>
> => {
	const res = await apiGet<RawBookingData[]>('/booking/logs', {
		next: { revalidate: 60 * 60, tags: ['booking'] },
	})

	return mapSuccess(
		res,
		(data) => mapRawBookingLogs(data),
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

const revalidateBookingCalendarsForDate = (date: string) => {
	const ranges = getBookingCalendarRangesForDate(date)
	ranges.forEach(({ startDate, endDate }) => {
		revalidateTag(buildBookingCalendarTag(startDate, endDate))
	})
	revalidateTag(BOOKING_CALENDAR_TAG)
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
		return withFallbackMessage(res, '予約の作成に失敗しました。')
	}

	revalidateTag('booking')
	revalidateTag(`booking-user-${userId}`)
	revalidateBookingCalendarsForDate(bookingDateKey)

	return createdResponse({ id: res.data.id })
}

export const updateBookingAction = async ({
	bookingId,
	userId,
	booking,
	today,
}: {
	bookingId: string
	userId: string
	booking: BookingPayload
	today: string
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
		},
	})

	if (!res.ok) {
		return withFallbackMessage(res, '予約の更新に失敗しました。')
	}

	revalidateTag('booking')
	revalidateTag(`booking-detail-${bookingId}`)
	revalidateTag(`booking-user-${userId}`)
	revalidateBookingCalendarsForDate(bookingDateKey)

	return noContentResponse()
}

export const deleteBookingAction = async ({
	bookingId,
	bookingDate,
	userId,
}: {
	bookingId: string
	bookingDate: string
	userId: string
}): Promise<ApiResponse<null>> => {
	const res = await apiDelete<null>(`/booking/${bookingId}`, {
		searchParams: { userId },
	})

	if (!res.ok) {
		return withFallbackMessage(res, '予約の削除に失敗しました。')
	}

	const bookingDateKey = toDateKey(bookingDate)

	revalidateTag('booking')
	revalidateTag(`booking-detail-${bookingId}`)
	revalidateTag(`booking-user-${userId}`)
	revalidateBookingCalendarsForDate(bookingDateKey)

	const cookieStore = await cookies()
	cookieStore.set(
		'booking:flash',
		JSON.stringify({ type: 'success', message: '予約を削除しました。' }),
		{ path: '/booking', maxAge: 10, httpOnly: true },
	)

	return noContentResponse()
}

export const authBookingAction = async ({
	bookingId,
	userId,
	password,
}: {
	bookingId: string
	userId: string
	password: string
}): Promise<ApiResponse<string>> => {
	const res = await apiPost<unknown>(`/booking/${bookingId}/verify`, {
		body: { userId, password },
	})

	if (!res.ok) {
		return withFallbackMessage(res, '予約の認証に失敗しました。')
	}

	return okResponse('verified')
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
