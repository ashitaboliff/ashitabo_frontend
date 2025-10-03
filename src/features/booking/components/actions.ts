import { apiRequest } from '@/lib/api'
import { ApiResponse, StatusCode } from '@/types/responseTypes'
import { Booking, BookingLog, BookingResponse } from '@/features/booking/types'

type BookingPayload = {
	bookingDate: string
	bookingTime: number
	registName: string
	name: string
	isDeleted?: boolean
}

const mapBooking = (input: any): Booking => ({
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

const mapBookingResponse = (input: any): BookingResponse => {
	const result: BookingResponse = {}
	Object.entries(input ?? {}).forEach(([date, timeMap]) => {
		result[date] = {}
		Object.entries(timeMap as Record<string, any>).forEach(
			([timeKey, booking]) => {
				const timeIndex = Number(timeKey)
				result[date][timeIndex] = booking ? mapBooking(booking) : null
			},
		)
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
	const res = await apiRequest<Record<string, Record<string, any>>>(
		'/booking',
		{
			method: 'GET',
			searchParams: {
				start: startDate,
				end: endDate,
			},
			cache: 'no-store',
		},
	)

	if (
		res.status === StatusCode.OK &&
		typeof res.response !== 'string'
	) {
		return {
			status: res.status,
			response: mapBookingResponse(res.response),
		}
	}

	return res
}

export const getAllBookingAction = async (): Promise<
	ApiResponse<BookingLog[]>
> => {
	const res = await apiRequest<BookingLog[]>('/booking/logs', {
		method: 'GET',
		cache: 'no-store',
	})

	if (
		res.status === StatusCode.OK &&
		Array.isArray(res.response)
	) {
		return {
			status: res.status,
			response: res.response.map((log) => mapBooking(log)) as BookingLog[],
		}
	}

	return res
}

export const getBookingByIdAction = async (
	bookingId: string,
): Promise<ApiResponse<Booking>> => {
	const res = await apiRequest<Booking>(`/booking/${bookingId}`, {
		method: 'GET',
		cache: 'no-store',
	})

	if (
		res.status === StatusCode.OK &&
		typeof res.response !== 'string'
	) {
		return {
			status: res.status,
			response: mapBooking(res.response),
		}
	}

	return res
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
	const res = await apiRequest<{
		bookings: Booking[]
		totalCount: number
	}>(`/booking/user/${userId}`, {
		method: 'GET',
		searchParams: {
			page,
			perPage,
			sort,
		},
		cache: 'no-store',
	})

	if (
		res.status === StatusCode.OK &&
		typeof res.response !== 'string'
	) {
		return {
			status: res.status,
			response: {
				bookings: res.response.bookings.map((booking) => mapBooking(booking)),
				totalCount: res.response.totalCount,
			},
		}
	}

	return res
}

export const createBookingAction = async ({
	bookingId,
	userId,
	booking,
	password,
	toDay,
}: {
	bookingId: string
	userId: string
	booking: BookingPayload
	password: string
	toDay: string
}): Promise<ApiResponse<string>> => {
	const res = await apiRequest(`/booking`, {
		method: 'POST',
		body: {
			id: bookingId,
			userId,
			bookingDate: booking.bookingDate,
			bookingTime: booking.bookingTime,
			registName: booking.registName,
			name: booking.name,
			password,
			today: toDay,
		},
	})

	if (res.status === StatusCode.CREATED) {
		return { status: StatusCode.CREATED, response: 'created' }
	}

	return {
		status: res.status as StatusCode,
		response:
			typeof res.response === 'string'
				? res.response
				: '予約の作成に失敗しました。',
	} as ApiResponse<string>
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
	const res = await apiRequest(`/booking/${bookingId}`, {
		method: 'PUT',
		body: {
			userId,
			bookingDate: booking.bookingDate,
			bookingTime: booking.bookingTime,
			registName: booking.registName,
			name: booking.name,
			isDeleted: booking.isDeleted ?? false,
		},
	})

	if (res.status === StatusCode.NO_CONTENT) {
		const detail = await getBookingByIdAction(bookingId)
		if (
			detail.status === StatusCode.OK &&
			detail.response &&
			typeof detail.response !== 'string'
		) {
			return {
				status: StatusCode.OK,
				response: detail.response,
			}
		}
		return detail
	}

	if (
		res.status === StatusCode.OK &&
		typeof res.response !== 'string'
	) {
		return {
			status: StatusCode.OK,
			response: mapBooking(res.response),
		}
	}

	return {
		status: res.status as StatusCode,
		response:
			typeof res.response === 'string'
				? res.response
				: '予約の更新に失敗しました。',
	} as ApiResponse<Booking>
}

export const deleteBookingAction = async ({
	bookingId,
	userId,
}: {
	bookingId: string
	userId: string
}): Promise<ApiResponse<null>> => {
	const res = await apiRequest(`/booking/${bookingId}`, {
		method: 'DELETE',
		searchParams: { userId },
	})

	if (res.status === StatusCode.NO_CONTENT) {
		return { status: StatusCode.OK, response: null }
	}

	return res as ApiResponse<null>
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
	const res = await apiRequest(`/booking/${bookingId}/verify`, {
		method: 'POST',
		body: { userId, password },
	})

	if (res.status === StatusCode.OK) {
		return { status: StatusCode.OK, response: 'verified' }
	}

	return {
		status: res.status as StatusCode,
		response:
			typeof res.response === 'string'
				? res.response
				: '予約の認証に失敗しました。',
	} as ApiResponse<string>
}

export const bookingRevalidateTagAction = async ({
	tag,
}: {
	tag: string
}): Promise<ApiResponse<null>> => {
	console.info(`booking revalidate tag placeholder for ${tag}`)
	return { status: StatusCode.OK, response: null }
}

export const revalidateBookingDataAction = async (): Promise<
	ApiResponse<null>
> => {
	console.info('booking data revalidation placeholder')
	return { status: StatusCode.OK, response: null }
}
