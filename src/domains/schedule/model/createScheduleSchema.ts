import * as zod from 'zod'
import { DateToDayISOstring } from '@/shared/utils'

const today = () => new Date()

export const scheduleCreateSchema = zod
	.object({
		startDate: zod.date({ message: '開始日を選択してください' }),
		endDate: zod.date({ message: '終了日を選択してください' }),
		deadline: zod.date({ message: '締め切り日を選択してください' }),
		isTimeExtended: zod.boolean().default(false),
		isMentionChecked: zod.boolean().default(false),
		mention: zod
			.array(zod.string().min(1, '不正なユーザーが選択されました'))
			.optional(),
		title: zod.string().min(1, 'タイトルを入力してください'),
		description: zod
			.string()
			.max(500, '説明は500文字以内で入力してください')
			.optional()
			.or(zod.literal('')),
	})
	.superRefine((data, ctx) => {
		const now = today()

		if (data.startDate < now) {
			ctx.addIssue({
				code: zod.ZodIssueCode.custom,
				message: '未来の日付を選択してください',
				path: ['startDate'],
			})
		}
		if (data.endDate < data.startDate) {
			ctx.addIssue({
				code: zod.ZodIssueCode.custom,
				message: '終了日は開始日以降の日付を選択してください',
				path: ['endDate'],
			})
		}
		if (data.deadline > data.startDate) {
			ctx.addIssue({
				code: zod.ZodIssueCode.custom,
				message: '締め切りは開始日以前の日付を選択してください',
				path: ['deadline'],
			})
		}
		if (data.deadline < now) {
			ctx.addIssue({
				code: zod.ZodIssueCode.custom,
				message: '締め切りには未来の日付を選択してください',
				path: ['deadline'],
			})
		}
		if (data.isMentionChecked) {
			if (!data.mention || data.mention.length === 0) {
				ctx.addIssue({
					code: zod.ZodIssueCode.custom,
					message: '日程調整に参加する部員を選択してください',
					path: ['mention'],
				})
			}
		}
	})

export type ScheduleCreateFormValues = zod.infer<typeof scheduleCreateSchema>
export type ScheduleCreateFormInput = zod.input<typeof scheduleCreateSchema>

export const toSchedulePayload = (values: ScheduleCreateFormValues) => {
	return {
		...values,
		start: DateToDayISOstring(values.startDate),
		end: DateToDayISOstring(values.endDate),
		deadline: DateToDayISOstring(values.deadline),
	}
}
