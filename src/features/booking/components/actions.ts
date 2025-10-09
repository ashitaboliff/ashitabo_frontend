import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api/crud'
import { ApiResponse, StatusCode } from '@/types/responseTypes'
import {
	createdResponse,
	mapSuccess,
	noContentResponse,
	okResponse,
	withFallbackMessage,
} from '@/lib/api/helper'
import { Booking, BookingLog, BookingResponse } from '@/features/booking/types'

type BookingPayload = {
	bookingDate: string
	bookingTime: number
	registName: string
	name: string
	isDeleted?: boolean
}

interface RawBookingData {
	id: string
	userId: string
	createdAt: string
	updatedAt: string
	bookingDate: string
	bookingTime: number
	registName: string
	name: string
	isDeleted?: boolean
}

type RawBookingResponse = Record<string, Record<string, RawBookingData | null>>

const mapBooking = (input: RawBookingData): Booking => ({
	id: input.id,
	userId: input.userId,
	createdAt: new Date(input.createdAt),
	updatedAt: new Date(input.updatedAt),
	bookingDate: input.bookingDate,
	bookingTime: input.bookingTime,
	registName: input.registName,
	name: input.name,
	isDeleted: input.isDeleted ?? false,
})

const mapBookingResponse = (
	input: RawBookingResponse | null,
): BookingResponse => {
	if (!input) {
		return {}
	}

	const result: BookingResponse = {}
	Object.entries(input).forEach(([date, timeMap]) => {
		result[date] = {}
		Object.entries(timeMap ?? {}).forEach(([timeKey, booking]) => {
			const timeIndex = Number(timeKey)
			result[date][timeIndex] = booking ? mapBooking(booking) : null
		})
	})
	return result
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
		...(typeof window === 'undefined'
			? { next: { revalidate: 10, tags: ['booking-calendar'] } }
			: {}),
	})

	return mapSuccess(
		res,
		(payload) => mapBookingResponse(payload ?? {}),
		'予約情報の取得に失敗しました。',
	)
}

export const getAllBookingAction = async (): Promise<
	ApiResponse<BookingLog[]>
> => {
	const res = await apiGet<RawBookingData[]>('/booking/logs', {
		...(typeof window === 'undefined'
			? { next: { revalidate: 60, tags: ['booking-logs'] } }
			: {}),
	})

	return mapSuccess(
		res,
		(rawLogs) => (rawLogs ?? []).map((log) => mapBooking(log)) as BookingLog[],
		'予約ログの取得に失敗しました。',
	)
}

export const getBookingByIdAction = async (
	bookingId: string,
): Promise<ApiResponse<Booking>> => {
	const res = await apiGet<RawBookingData>(`/booking/${bookingId}`, {
		...(typeof window === 'undefined'
			? { next: { revalidate: 30, tags: ['booking-detail', bookingId] } }
			: {}),
	})

	if (!res.ok) {
		return withFallbackMessage(res, '予約詳細の取得に失敗しました。')
	}

	if (!res.data) {
		return withFallbackMessage(
			{
				ok: false,
				status: StatusCode.INTERNAL_SERVER_ERROR,
				message: '',
			},
			'予約詳細の取得に失敗しました。',
		)
	}

	return okResponse(mapBooking(res.data))
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
		...(typeof window === 'undefined'
			? { next: { revalidate: 15, tags: ['booking-user', userId] } }
			: {}),
	})

	return mapSuccess(
		res,
		(payload) => ({
			bookings: ((payload?.bookings ?? []) as RawBookingData[]).map((booking) =>
				mapBooking(booking),
			),
			totalCount: payload?.totalCount ?? 0,
		}),
		'ユーザー予約の取得に失敗しました。',
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
			bookingDate: booking.bookingDate.split('T')[0],
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
}): Promise<ApiResponse<Booking>> => {
	const res = await apiPut<RawBookingData>(`/booking/${bookingId}`, {
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

	if (res.status === StatusCode.NO_CONTENT) {
		return getBookingByIdAction(bookingId)
	}

	return okResponse(mapBooking(res.data))
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
