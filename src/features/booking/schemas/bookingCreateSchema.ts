import * as zod from 'zod'

export const bookingCreateSchema = zod.object({
	bookingDate: zod.string().min(1, { message: '予約日を入力してください。' }),
	bookingTime: zod.string().min(1, { message: '予約時間を入力してください。' }),
	registName: zod
		.string()
		.trim()
		.min(1, { message: 'バンド名を入力してください。' })
		.max(100, { message: 'バンド名は100文字以内で入力してください。' }),
	name: zod
		.string()
		.trim()
		.min(1, { message: '責任者名を入力してください。' })
		.max(100, { message: '責任者名は100文字以内で入力してください。' }),
	password: zod
		.string()
		.trim()
		.min(1, { message: '予約に必要なパスワードを入力してください。' })
		.max(128, { message: 'パスワードは128文字以内で入力してください。' }),
})

export type BookingCreateFormValues = zod.infer<typeof bookingCreateSchema>
export type BookingCreateFormInput = zod.input<typeof bookingCreateSchema>
