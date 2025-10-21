'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { eachDayOfInterval } from 'date-fns'
import { useRouter } from 'next-nprogress-bar'
import { useEffect, useMemo, useState } from 'react'
import { Controller, type SubmitHandler, useForm } from 'react-hook-form'
import CustomDatePicker from '@/shared/ui/atoms/DatePicker'
import ShareButton from '@/shared/ui/atoms/ShareButton'
import TextareaInputField from '@/shared/ui/atoms/TextareaInputField'
import TextInputField from '@/shared/ui/atoms/TextInputField'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import MultiSelectField from '@/shared/ui/molecules/MultiSelectField'
import {
	type ScheduleCreateFormInput,
	type ScheduleCreateFormValues,
	scheduleCreateSchema,
} from '@/domains/schedule/schemas/createScheduleSchema'
import { useFeedback } from '@/shared/hooks/useFeedback'
import type { Session } from '@/types/session'
import { DateToDayISOstring } from '@/shared/utils'
import { formatDateSlashWithWeekday } from '@/shared/utils/dateFormat'
import { logError } from '@/shared/utils/logger'
import { createScheduleAction } from '@/domains/schedule/api/scheduleActions'

interface Props {
	session: Session
	initialUsers: Record<string, string>
}

interface CreatedScheduleSummary {
	id: string
	title: string
	description?: string
	mention: string[]
	startDate: Date
	endDate: Date
	deadline: Date
}

const scheduleFormDefaults: Partial<ScheduleCreateFormInput> = {
	isTimeExtended: false,
	isMentionChecked: false,
	mention: [],
	title: '',
	description: '',
}

const generateScheduleId = () => {
	if (
		typeof crypto !== 'undefined' &&
		typeof crypto.randomUUID === 'function'
	) {
		return crypto.randomUUID()
	}
	return Math.random().toString(36).slice(2)
}

const ScheduleCreatePage = ({
	session,
	initialUsers,
}: Props) => {
	const router = useRouter()
	const [currentScheduleId, setCurrentScheduleId] = useState(generateScheduleId)
	const [createdSchedule, setCreatedSchedule] =
		useState<CreatedScheduleSummary | null>(null)
	const messageFeedback = useFeedback()

	const mentionOptions = useMemo(() => {
		return Object.entries(initialUsers).reduce<Record<string, string>>(
			(acc, [id, name]) => {
				const label = name ? `${name} (${id.slice(0, 4)})` : id
				acc[label] = id
				return acc
			},
			{},
		)
	}, [initialUsers])

	const userNameById = useMemo(() => initialUsers, [initialUsers])

	const {
		register,
		handleSubmit,
		control,
		setValue,
		watch,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ScheduleCreateFormInput, unknown, ScheduleCreateFormValues>({
		resolver: zodResolver(scheduleCreateSchema),
		defaultValues: scheduleFormDefaults,
	})

	useEffect(() => {
		register('mention')
	}, [register])

	const isMentionChecked = watch('isMentionChecked') ?? false
	const mentionSelection = watch('mention') ?? []
	const startDate = watch('startDate')

	useEffect(() => {
		if (!isMentionChecked && mentionSelection.length > 0) {
			setValue('mention', [], { shouldDirty: true, shouldValidate: true })
		}
	}, [isMentionChecked, mentionSelection, setValue])

	const onSubmit: SubmitHandler<ScheduleCreateFormValues> = async (data) => {
		messageFeedback.clearFeedback()
		setCreatedSchedule(null)

		try {
			const allDates = eachDayOfInterval({
				start: data.startDate,
				end: data.endDate,
			})
			const dates = allDates.map((date) => DateToDayISOstring(date))

			const response = await createScheduleAction({
				id: currentScheduleId,
				userId: session.user.id,
				title: data.title,
				description: data.description,
				dates,
				mention: data.isMentionChecked ? (data.mention ?? []) : [],
				timeExtended: data.isTimeExtended,
				deadline: DateToDayISOstring(data.deadline),
			})

			if (response.ok) {
				setCreatedSchedule({
					id: currentScheduleId,
					title: data.title,
					description: data.description ?? '',
					mention: data.isMentionChecked ? (data.mention ?? []) : [],
					startDate: data.startDate,
					endDate: data.endDate,
					deadline: data.deadline,
				})
				messageFeedback.showSuccess('日程調整を作成しました。')
				reset()
				setCurrentScheduleId(generateScheduleId())
			} else {
				messageFeedback.showApiError(response)
			}
		} catch (error) {
			messageFeedback.showError(
				'日程調整の作成中にエラーが発生しました。時間をおいて再度お試しください。',
				{
					details: error instanceof Error ? error.message : String(error),
				},
			)
			logError('create schedule error', error)
		}
	}

	const shareUrl =
		typeof window !== 'undefined' && createdSchedule
			? `${window.location.origin}/schedule/${createdSchedule.id}`
			: ''

	return (
		<div className="flex flex-col items-center justify-center py-6 bg-white rounded-lg shadow-md">
			<h1 className="text-2xl font-bold mb-4">日程調整作成</h1>
			<div className="w-full max-w-xl space-y-4">
				<FeedbackMessage source={messageFeedback.feedback} />
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<TextInputField
						type="text"
						register={register('title')}
						label="イベント名"
						name="title"
						errorMessage={errors.title?.message}
					/>
					<TextareaInputField
						register={register('description')}
						label="イベント内容"
						name="description"
						errorMessage={errors.description?.message}
					/>
					<label className="cursor-pointer label gap-x-2 justify-start items-center">
						<input
							type="checkbox"
							{...register('isTimeExtended')}
							className="checkbox checkbox-primary"
						/>
						<span className="label-text text-base">細かい時間指定をオン</span>
					</label>
					<p className="text-sm">
						コマ表の時間を超えた予定調整が可能になります。
					</p>
					<label className="cursor-pointer label gap-x-2 justify-start items-center">
						<input
							type="checkbox"
							{...register('isMentionChecked')}
							className="checkbox checkbox-primary"
						/>
						<span className="label-text text-base">メンションをオン</span>
					</label>
					<p className="text-sm">特定の部員とだけの予定を作成できます。</p>
					{isMentionChecked && (
						<MultiSelectField
							name="mention"
							label="メンション"
							options={mentionOptions}
							setValue={setValue}
							watchValue={mentionSelection}
							errorMessage={errors.mention?.message}
							className="bg-white"
						/>
					)}
					<Controller
						name="startDate"
						control={control}
						render={({ field }) => (
							<CustomDatePicker
								label="開始日"
								selectedDate={field.value ?? null}
								onChange={field.onChange}
								minDate={new Date()}
								errorMessage={errors.startDate?.message}
							/>
						)}
					/>
					<Controller
						name="endDate"
						control={control}
						render={({ field }) => (
							<CustomDatePicker
								label="終了日"
								selectedDate={field.value ?? null}
								onChange={field.onChange}
								minDate={startDate}
								errorMessage={errors.endDate?.message}
							/>
						)}
					/>
					<Controller
						name="deadline"
						control={control}
						render={({ field }) => (
							<CustomDatePicker
								label="締め切り"
								selectedDate={field.value ?? null}
								onChange={field.onChange}
								minDate={new Date()}
								errorMessage={errors.deadline?.message}
							/>
						)}
					/>
					<div className="flex flex-col sm:flex-row gap-2">
						<button
							className="btn btn-primary btn-md"
							type="submit"
							disabled={isSubmitting}
						>
							{isSubmitting ? '作成中...' : '作成'}
						</button>
						<button
							type="button"
							className="btn btn-outline btn-md"
							onClick={() => router.back()}
						>
							戻る
						</button>
					</div>
				</form>

				{createdSchedule && (
					<div className="mt-6 rounded-md border border-base-200 bg-base-100 p-4 space-y-2">
						<h2 className="text-lg font-semibold">作成した日程</h2>
						<p>タイトル: {createdSchedule.title}</p>
						<p>
							日程:
							{formatDateSlashWithWeekday(createdSchedule.startDate, {
								space: false,
							})}{' '}
							-{' '}
							{formatDateSlashWithWeekday(createdSchedule.endDate, {
								space: false,
							})}
						</p>
						<p>説明: {createdSchedule.description || '未入力'}</p>
						<p>
							締め切り:{' '}
							{formatDateSlashWithWeekday(createdSchedule.deadline, {
								space: false,
							})}
						</p>
						{createdSchedule.mention.length > 0 && (
							<p>
								メンション:{' '}
								{createdSchedule.mention
									.map((id) => userNameById[id] ?? id)
									.join(', ')}
							</p>
						)}
						<div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end pt-2">
							{shareUrl ? (
								<ShareButton
									url={shareUrl}
									title="日程調整を共有"
									text={`日程: ${formatDateSlashWithWeekday(
										createdSchedule.startDate,
										{ space: false },
									)} - ${formatDateSlashWithWeekday(createdSchedule.endDate, {
										space: false,
									})}`}
									isFullButton
								/>
							) : (
								<p className="text-sm text-gray-500">
									シェアURLを取得できませんでした。
								</p>
							)}
							<button
								type="button"
								className="btn btn-secondary"
								onClick={() => router.push('/schedule')}
							>
								一覧に戻る
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default ScheduleCreatePage
