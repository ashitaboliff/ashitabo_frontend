import { Booking, BookingLog, BookingResponse } from '@/features/booking/types'

export interface RawBookingData {
	id: string
	userId: string
	createdAt: string
	updatedAt: string
	bookingDate: string
	bookingTime: number
	registName: string
	name: string
	isDeleted?: boolean | null
}

export type RawBookingResponse = Record<
	string,
	Record<string, RawBookingData | null>
>

const toDate = (value: string | Date): Date =>
	value instanceof Date ? value : new Date(value)

export const mapRawBooking = (input: RawBookingData): Booking => ({
	id: input.id,
	userId: input.userId,
	createdAt: toDate(input.createdAt),
	updatedAt: toDate(input.updatedAt),
	bookingDate: input.bookingDate,
	bookingTime: input.bookingTime,
	registName: input.registName,
	name: input.name,
	isDeleted: Boolean(input.isDeleted),
})

export const mapRawBookingResponse = (
	input: RawBookingResponse | null | undefined,
): BookingResponse => {
	if (!input) {
		return {}
	}

	const result: BookingResponse = {}

	for (const [date, timeMap] of Object.entries(input)) {
		const mappedTimes: Record<number, Booking | null> = {}
		for (const [timeKey, value] of Object.entries(timeMap ?? {})) {
			const index = Number(timeKey)
			mappedTimes[index] = value ? mapRawBooking(value) : null
		}
		result[date] = mappedTimes
	}

	return result
}

export const mapRawBookingList = (
	input: RawBookingData[] | null | undefined,
): Booking[] => {
	if (!input) {
		return []
	}
	return input.map(mapRawBooking)
}

export const mapRawBookingLogs = (
	input: RawBookingData[] | null | undefined,
): BookingLog[] => mapRawBookingList(input)
