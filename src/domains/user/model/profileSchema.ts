import * as zod from 'zod'
import {
	type Part,
	PartOptions,
	type Profile,
	type Role,
	RoleMap,
} from '@/domains/user/model/userTypes'
import { generateAcademicYear, generateFiscalYearObject } from '@/shared/utils'

const academicYearLastTwoDigits = generateAcademicYear() % 100

export const validYearTokens = Array.from(
	{ length: 9 },
	(_, index) => (academicYearLastTwoDigits - index + 100) % 100,
).map((year) => year.toString().padStart(2, '0'))

export const expectedYearMap = generateFiscalYearObject()
export const expectedYearValues = Object.values(expectedYearMap).map((value) =>
	String(value),
)

const yearRegex = `(${validYearTokens.join('|')})`

export const profileSchema = zod
	.object({
		name: zod.string().min(1, '名前を入力してください'),
		role: zod.string().refine((role) => Object.keys(RoleMap).includes(role), {
			message: 'どちらかを選択してください',
		}),
		studentId: zod
			.string()
			.regex(
				new RegExp(`^${yearRegex}[A-Za-z](\\d{1}\\d{3}[A-Za-z]|\\d{3})$`),
				'学籍番号のフォーマットが正しくありません',
			)
			.optional(),
		expected: zod.string().optional(),
		part: zod
			.array(
				zod
					.string()
					.refine(
						(part) =>
							Object.values(PartOptions).includes(
								part as (typeof PartOptions)[keyof typeof PartOptions],
							),
						{ message: '使用楽器を選択してください' },
					),
			)
			.min(1, '使用楽器を選択してください'),
	})
	.superRefine((data, ctx) => {
		if (data.role === 'STUDENT') {
			if (!data.studentId) {
				ctx.addIssue({
					code: 'custom',
					message: '学籍番号を入力してください',
					path: ['studentId'],
				})
			}
			if (!data.expected) {
				ctx.addIssue({
					code: 'custom',
					message: '卒業予定年度を選択してください',
					path: ['expected'],
				})
			} else if (!expectedYearValues.includes(data.expected)) {
				ctx.addIssue({
					code: 'custom',
					message: '卒業予定年度を選択してください',
					path: ['expected'],
				})
			}
		}
	})

export type ProfileFormValues = zod.infer<typeof profileSchema>

export const profileDefaultValues: ProfileFormValues = {
	name: '',
	role: 'STUDENT',
	studentId: undefined,
	expected: undefined,
	part: [],
}

export const toProfileFormValues = (
	profile?: Profile | null,
): ProfileFormValues => ({
	name: profile?.name ?? '',
	role: (profile?.role ?? 'STUDENT') as Role,
	studentId: profile?.studentId ?? undefined,
	expected: profile?.expected ?? undefined,
	part: (profile?.part ?? []) as Part[],
})

export const getAutoExpectedYear = (studentId?: string) => {
	if (!studentId || studentId.length < 2) return undefined
	const yearPrefix = studentId.substring(0, 2)
	const alphabet = studentId.charAt(2)?.toUpperCase()
	let offset = 4
	switch (alphabet) {
		case 'T':
			offset = 6
			break
		case 'W':
			offset = 2
			break
		case 'E':
		case 'G':
		case 'F':
		case 'C':
			offset = 4
			break
		default:
			offset = 4
	}

	const expectedYear = `${(parseInt(yearPrefix, 10) + offset) % 100}`.padStart(
		2,
		'0',
	)
	return expectedYearValues.includes(expectedYear) ? expectedYear : undefined
}
