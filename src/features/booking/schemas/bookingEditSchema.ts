import * as zod from 'zod'

export const bookingEditSchema = zod.object({
	bookingDate: zod.string().min(1, '予約日を入力してください'),
	bookingTime: zod.string().min(1, '予約時間を入力してください'),
	registName: zod.string().min(1, 'バンド名を入力してください'),
	name: zod.string().min(1, '責任者名を入力してください'),
})

export type BookingEditFormValues = zod.infer<typeof bookingEditSchema>
