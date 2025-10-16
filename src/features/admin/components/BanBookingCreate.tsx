'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { eachDayOfInterval, getDay } from 'date-fns'
import { useRouter } from 'next-nprogress-bar'
import { useCallback, useId, useState } from 'react'
import { Controller, type SubmitHandler, useForm } from 'react-hook-form'
import * as zod from 'zod'
import CustomDatePicker from '@/components/ui/atoms/DatePicker'
import ErrorMessage from '@/components/ui/atoms/ErrorMessage'
import SelectField from '@/components/ui/atoms/SelectField'
import TextInputField from '@/components/ui/atoms/TextInputField'
import Popup from '@/components/ui/molecules/Popup'
import { BOOKING_TIME_LIST } from '@/features/booking/constants'
import type { ApiError } from '@/types/responseTypes'
import { DateToDayISOstring } from '@/utils'
import { logError } from '@/utils/logger'
import { createBookingBanDateAction } from '../action'

type BanTypeValue = 'single' | 'period' | 'regular'

type BanTypeLabel = '単発禁止' | '期間禁止' | '定期禁止'

const BanType: { value: BanTypeValue; label: BanTypeLabel }[] = [
	{ value: 'single', label: '単発禁止' },
	{ value: 'period', label: '期間禁止' },
	{ value: 'regular', label: '定期禁止' },
]

const dayOfWeek = [
	{ value: '0', label: '日' },
	{ value: '1', label: '月' },
	{ value: '2', label: '火' },
	{ value: '3', label: '水' },
	{ value: '4', label: '木' },
	{ value: '5', label: '金' },
	{ value: '6', label: '土' },
]

const BanBookingSchema = zod
	.object({
		type: zod.enum(['single', 'period', 'regular'], {
			message: '禁止タイプを選択してください',
		}),
		startDate: zod.date().min(new Date(), '過去の日付は選択できません'),
		endDate: zod.date().optional(),
		startTime: zod.string().min(1, '開始時間を入力してください'),
		endTime: zod.string().optional(),
		dayOfWeek: zod.preprocess(
			(v) => (v === '' ? undefined : v),
			zod.enum(['0', '1', '2', '3', '4', '5', '6']).optional(),
		),
		description: zod.string().min(1, '説明を入力してください'),
	})
	.superRefine((data, ctx) => {
		if (data.type === 'regular' && !data.endDate) {
			ctx.addIssue({
				code: zod.ZodIssueCode.custom,
				path: ['endDate'],
				message: '日付を入力してください',
			})
		}
		if (
			data.type !== 'single' &&
			(!data.endTime || data.endTime.length === 0)
		) {
			ctx.addIssue({
				code: zod.ZodIssueCode.custom,
				path: ['endTime'],
				message: '終了時間を入力してください',
			})
		}
		if (data.type === 'regular' && !data.dayOfWeek) {
			ctx.addIssue({
				code: zod.ZodIssueCode.custom,
				path: ['dayOfWeek'],
				message: '曜日を選択してください',
			})
		}
	})
type BanBookingFormInput = zod.input<typeof BanBookingSchema>
type BanBookingFormValues = zod.output<typeof BanBookingSchema>

const defaultFormValues: Partial<BanBookingFormInput> = {
	type: 'single',
	startDate: undefined,
	endDate: undefined,
	startTime: '',
	endTime: '',
	dayOfWeek: undefined,
	description: '',
}

const BanBookingCreate = () => {
	const router = useRouter()
	const popupId = useId()
	const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)
	const [error, setError] = useState<ApiError>()

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		control,
		watch,
	} = useForm<BanBookingFormInput, unknown, BanBookingFormValues>({
		mode: 'onBlur',
		resolver: zodResolver(BanBookingSchema),
		defaultValues: defaultFormValues,
	})

	const type = watch('type')

	const handleSuccess = useCallback(() => {
		reset(defaultFormValues)
		setIsPopupOpen(true)
	}, [reset])

	const handleError = useCallback((apiError: ApiError) => {
		setError(apiError)
	}, [])

	const onSubmit: SubmitHandler<BanBookingFormValues> = async (data) => {
		setError(undefined)
		try {
			if (data.type === 'single') {
				const res = await createBookingBanDateAction({
					startDate: DateToDayISOstring(data.startDate),
					startTime: Number(data.startTime),
					description: data.description,
				})
				if (res.ok) {
					handleSuccess()
				} else {
					handleError(res)
				}
				return
			}

			if (data.type === 'period') {
				const res = await createBookingBanDateAction({
					startDate: DateToDayISOstring(data.startDate),
					startTime: Number(data.startTime),
					endTime: Number(data.endTime),
					description: data.description,
				})
				if (res.ok) {
					handleSuccess()
				} else {
					handleError(res)
				}
				return
			}

			const allDates = eachDayOfInterval({
				start: data.startDate,
				end: data.endDate ?? data.startDate,
			})
			const dates = allDates
				.filter((date) => getDay(date) === Number(data.dayOfWeek))
				.map((date) => DateToDayISOstring(date))
			const res = await createBookingBanDateAction({
				startDate: dates,
				startTime: Number(data.startTime),
				endTime: Number(data.endTime),
				description: data.description,
			})
			if (res.ok) {
				handleSuccess()
			} else {
				handleError(res)
			}
		} catch (err) {
			logError('Failed to create booking ban', err)
			setError({
				ok: false,
				status: 500,
				message: '予約禁止日の作成中にエラーが発生しました。',
				details: err instanceof Error ? err.message : String(err),
			})
		}
	}

	return (
		<div className="flex flex-col items-center justify-center gap-y-2">
			<h1 className="text-2xl font-bold">予約禁止日追加</h1>
			<p className="text-sm text-center">
				このページでは予約禁止日の追加が可能です。
			</p>
			<form
				className="flex flex-col space-y-4 w-full max-w-md items-center px-8"
				onSubmit={handleSubmit(onSubmit)}
			>
				<div className="flex flex-row items-center space-x-2">
					{BanType.map((type) => (
						<div
							key={type.value}
							className="flex flex-row items-center space-x-2"
						>
							<input
								type="radio"
								id={type.value}
								{...register('type')}
								value={type.value}
								className="radio radio-primary"
							/>
							<label htmlFor={type.value}>{type.label}</label>
						</div>
					))}
				</div>
				{type === 'period' && (
					<p className="text-xs-custom">
						期間禁止:ある日のある時間からある時間までの予約を禁止したいときに利用します。
					</p>
				)}
				{type === 'regular' && (
					<p className="text-xs-custom">
						定期禁止:ある日付からある日付までの特定の曜日に対して、この時間からこの時間までは利用できない場合に利用します。
					</p>
				)}
				{type === 'single' && (
					<p className="text-xs-custom">
						単発禁止:この日のこの時間のみを禁止したいときに利用します。
					</p>
				)}
				<Controller
					name="startDate"
					control={control}
					render={({ field }) => (
						<CustomDatePicker
							label="開始日"
							selectedDate={field.value}
							onChange={field.onChange}
						/>
					)}
				/>
				{type === 'regular' && (
					<Controller
						name="endDate"
						control={control}
						render={({ field }) => (
							<CustomDatePicker
								label="終了日"
								selectedDate={field.value ?? null}
								onChange={field.onChange}
							/>
						)}
					/>
				)}
				<SelectField
					label="開始時間"
					name="startTime"
					register={register('startTime')}
					options={BOOKING_TIME_LIST.reduce(
						(acc, time, index) => {
							acc[time] = index.toString()
							return acc
						},
						{} as Record<string, string>,
					)}
					errorMessage={errors.startTime?.message}
				/>
				{type !== 'single' && (
					<SelectField
						label="終了時間"
						name="endTime"
						register={register('endTime')}
						options={BOOKING_TIME_LIST.reduce(
							(acc, time, index) => {
								acc[time] = index.toString()
								return acc
							},
							{} as Record<string, string>,
						)}
						errorMessage={errors.endTime?.message}
					/>
				)}
				{type === 'regular' && (
					<div className="w-full">
						<span className="label-text font-semibold">繰り返し</span>
						<div className="flex flex-row items-center justify-between space-x-2">
							<div className="whitespace-nowrap text-sm">毎週</div>
							<SelectField
								name="dayOfWeek"
								register={register('dayOfWeek')}
								options={dayOfWeek.reduce(
									(acc, day) => {
										acc[day.label] = day.value
										return acc
									},
									{} as Record<string, string>,
								)}
								errorMessage={errors.dayOfWeek?.message}
							/>
							<div className="whitespace-nowrap text-sm">曜日</div>
						</div>
					</div>
				)}
				<TextInputField
					type="text"
					register={register('description')}
					label="説明"
					errorMessage={errors.description?.message}
				/>
				<div className="flex flex-row gap-x-2">
					<button className="btn btn-primary btn-md" type="submit">
						送信
					</button>
					<button
						className="btn btn-outline btn-md"
						type="button"
						onClick={() => router.push('/admin/forbidden')}
					>
						戻る
					</button>
				</div>
			</form>
			<ErrorMessage error={error} />
			<Popup
				id={popupId}
				title="予約禁止日追加"
				open={isPopupOpen}
				onClose={() => setIsPopupOpen(false)}
			>
				<div className="p-4 flex flex-col justify-center gap-2">
					<p className="font-bold text-primary text-center">
						予約禁止日を追加しました
					</p>
					<button
						type="button"
						className="btn btn-outline"
						onClick={() => router.push('/admin/forbidden')}
					>
						予約禁止日一覧に戻る
					</button>
				</div>
			</Popup>
		</div>
	)
}

export default BanBookingCreate
