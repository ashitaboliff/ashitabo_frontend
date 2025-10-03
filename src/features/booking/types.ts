export interface Booking {
	id: string
	userId: string
	createdAt: Date
	updatedAt: Date
	bookingDate: string
	bookingTime: number
	registName: string
	name: string
	isDeleted: boolean
}

export type BanBooking = {
	id: string
	createdAt: Date
	updatedAt: Date
	startDate: Date
	startTime: number
	endTime: number | null
	description: string
	isDeleted: boolean
}

export type BookingDetailProps = Booking

export type BookingResponse = Record<string, Record<number, Booking | null>>

export interface BookingLog {
	id: string
	userId: string
	createdAt: Date
	updatedAt: Date
	bookingDate: string
	bookingTime: number
	registName: string
	name: string
	isDeleted: boolean
}

export const BookingTime = [
	'9:00~10:30',
	'10:30~12:00',
	'12:00~13:30',
	'13:30~15:00',
	'15:00~16:30',
	'16:30~18:00',
	'18:00~19:30',
	'19:30~21:00',
]
