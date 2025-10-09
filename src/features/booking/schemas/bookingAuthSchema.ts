import * as zod from 'zod'

export const bookingAuthSchema = zod.object({
	password: zod.string().min(1, 'パスワードを入力してください'),
})

export type BookingAuthFormValues = zod.infer<typeof bookingAuthSchema>
