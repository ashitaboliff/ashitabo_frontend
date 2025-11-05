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

export type DeniedBooking = {
	id: string
	createdAt: Date
	updatedAt: Date
	startDate: string
	startTime: number
	endTime: number | null
	description: string
	isDeleted: boolean
}

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
