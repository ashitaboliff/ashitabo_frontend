import { z } from 'zod'

export const padLockFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, '鍵管理のための名前を入力してください')
		.max(100, '鍵管理のための名前は100文字以内で入力してください'),
	password: z
		.string()
		.regex(/^[0-9]{4}$/u, 'パスワードは4桁の数字で入力してください'),
})

export const adminUserSortSchema = z.enum(['new', 'old'])

export const deniedBookingSortSchema = z.enum(['new', 'old', 'relativeCurrent'])

export const deniedBookingTypeSchema = z.enum(['single', 'period', 'regular'])

export const deniedBookingFormSchema = z
	.object({
		type: deniedBookingTypeSchema,
		startDate: z.date().min(new Date(), '過去の日付は選択できません'),
		endDate: z.date().optional(),
		startTime: z.string().min(1, '開始時間を入力してください'),
		endTime: z.string().optional(),
		dayOfWeek: z.preprocess(
			(value) => (value === '' ? undefined : value),
			z.enum(['0', '1', '2', '3', '4', '5', '6']).optional(),
		),
		description: z.string().min(1, '説明を入力してください'),
	})
	.superRefine((data, ctx) => {
		if (data.type === 'regular' && !data.endDate) {
			ctx.addIssue({
				code: 'custom',
				path: ['endDate'],
				message: '日付を入力してください',
			})
		}
		if (
			data.type !== 'single' &&
			(!data.endTime || data.endTime.length === 0)
		) {
			ctx.addIssue({
				code: 'custom',
				path: ['endTime'],
				message: '終了時間を入力してください',
			})
		}
		if (data.type === 'regular' && !data.dayOfWeek) {
			ctx.addIssue({
				code: 'custom',
				path: ['dayOfWeek'],
				message: '曜日を選択してください',
			})
		}
	})
