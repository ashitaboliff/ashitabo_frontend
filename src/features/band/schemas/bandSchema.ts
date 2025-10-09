import * as zod from 'zod'

export const bandFormSchema = zod.object({
	name: zod
		.string()
		.trim()
		.min(1, { message: 'バンド名を入力してください。' })
		.max(100, { message: 'バンド名は100文字以内で入力してください。' }),
})

export type BandFormValues = zod.infer<typeof bandFormSchema>
