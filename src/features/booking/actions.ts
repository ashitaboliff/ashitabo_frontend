import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api/crud'
import { ApiResponse, StatusCode } from '@/types/responseTypes'
import {
	createdResponse,
	noContentResponse,
	okResponse,
	mapSuccess,
	withFallbackMessage,
} from '@/lib/api/helper'
import { Booking, BookingLog, BookingResponse } from '@/features/booking/types'
import { toDateKey } from '@/utils'
import {
	mapRawBooking,
	mapRawBookingList,
	mapRawBookingLogs,
	mapRawBookingResponse,
	type RawBookingData,
	type RawBookingResponse,
} from '@/features/booking/services/bookingTransforms'

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
		next: { revalidate: 10, tags: ['booking-calendar'] },
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
		next: { revalidate: 60 * 60, tags: ['booking-logs'] },
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
		next: { revalidate: 30, tags: ['booking-detail', bookingId] },
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
		next: { revalidate: 15, tags: ['booking-user', userId] },
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
	toDay,
}: {
	userId: string
	booking: BookingPayload
	password: string
	toDay: string
}): Promise<ApiResponse<{ id: string }>> => {
	const res = await apiPost<{ id: string }>('/booking', {
		body: {
			userId,
			bookingDate: toDateKey(booking.bookingDate),
			bookingTime: booking.bookingTime,
			registName: booking.registName,
			name: booking.name,
			password,
			today: toDay,
		},
	})

	if (!res.ok) {
		return withFallbackMessage(res, '予約の作成に失敗しました。')
	}

	return createdResponse({ id: res.data.id })
}

export const updateBookingAction = async ({
	bookingId,
	userId,
	booking,
}: {
	bookingId: string
	userId: string
	booking: BookingPayload
}): Promise<ApiResponse<null>> => {
	const res = await apiPut<null>(`/booking/${bookingId}`, {
		body: {
			userId,
			bookingDate: booking.bookingDate,
			bookingTime: booking.bookingTime,
			registName: booking.registName,
			name: booking.name,
			isDeleted: booking.isDeleted ?? false,
		},
	})

	if (!res.ok) {
		return withFallbackMessage(res, '予約の更新に失敗しました。')
	}

	return noContentResponse()
}

export const deleteBookingAction = async ({
	bookingId,
	userId,
}: {
	bookingId: string
	userId: string
}): Promise<ApiResponse<null>> => {
	const res = await apiDelete<null>(`/booking/${bookingId}`, {
		searchParams: { userId },
	})

	if (!res.ok) {
		return withFallbackMessage(res, '予約の削除に失敗しました。')
	}

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
		next: { revalidate: 24 * 60 * 60, tags: ['booking-ids'] },
	})

	if (response.ok && Array.isArray(response.data)) {
		return response.data
	}
	return []
}
