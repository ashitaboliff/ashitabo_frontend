import * as zod from 'zod'

export const bookingEditSchema = zod.object({
	bookingDate: zod.string().min(1, '予約日を入力してください'),
	bookingTime: zod.number(),
	registName: zod.string().min(1, 'バンド名を入力してください'),
	name: zod.string().min(1, '責任者名を入力してください'),
})

export const bookingEditCalendarSchema = zod.object({
	bookingDate: zod.string().min(1, '予約日を入力してください'),
	bookingTime: zod.number(),
})

export type BookingEditFormValues = zod.infer<typeof bookingEditSchema>

export type BookingEditCalendarValues = zod.infer<
	typeof bookingEditCalendarSchema
>
