'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next-nprogress-bar'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { format, eachDayOfInterval } from 'date-fns'
import { ja } from 'date-fns/locale'
import { DateToDayISOstring } from '@/utils'
import { ApiError, StatusCode } from '@/types/responseTypes'
import ShareButton from '@/components/ui/atoms/ShareButton'
import CustomDatePicker from '@/components/ui/atoms/DatePicker'
import TextInputField from '@/components/ui/atoms/TextInputField'
import TextareaInputField from '@/components/ui/atoms/TextareaInputField'
import SelectField from '@/components/ui/atoms/SelectField'
import Popup from '@/components/ui/molecules/Popup'
import { getUserIdWithNames, createScheduleAction } from './actions'
import type { Session } from '@/types/session'

const ScheduleCreateSchema = zod
	.object({
		startDate: zod.date().min(new Date(), '未来の日付を選択してください'),
		endDate: zod.date().min(new Date(), '未来の日付を選択してください'),
		deadline: zod.date().min(new Date(), '未来の日付を選択してください'),
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
		if (data.isMentionChecked) {
			if (!data.mention || data.mention.length === 0) {
				ctx.addIssue({
					code: zod.ZodIssueCode.custom,
					path: ['mention'],
					message: '日程調整に参加する部員を選択してください',
				})
			}
		}
		if (data.endDate < data.startDate) {
			ctx.addIssue({
				code: zod.ZodIssueCode.custom,
				path: ['endDate'],
				message: '終了日は開始日以降の日付を選択してください',
			})
		}
		if (data.deadline > data.startDate) {
			ctx.addIssue({
				code: zod.ZodIssueCode.custom,
				path: ['deadline'],
				message: '締め切りは開始日以前の日付を選択してください',
			})
		}
	})

interface ScheduleCreatePageProps {
	session: Session
	initialUsers: Record<string, string>
}

const ScheduleCreatePage = ({
	session,
	initialUsers,
}: ScheduleCreatePageProps) => {
	const generateScheduleId = () => {
		if (
			typeof crypto !== 'undefined' &&
			typeof crypto.randomUUID === 'function'
		) {
			return crypto.randomUUID()
		}
		return Math.random().toString(36).slice(2)
	}
	const router = useRouter()
	const {
		register,
		handleSubmit,
		control,
		setValue,
		watch,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(ScheduleCreateSchema),
	})
	const startDate = watch('startDate')
	const watchMention = watch('mention')
	const watchAll = watch()
	const isMentionChecked = watch('isMentionChecked')
	// const [isLoading, setIsLoading] = useState<boolean>(false) // isLoading for users is removed
	const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false)
	const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)
	const [error, setError] = useState<ApiError>()

	const [scheduleId] = useState<string>(generateScheduleId())

	// const [users, setUsers] = useState<Record<string, string>>({}) // users are now from props

	const onSubmit = async (data: any) => {
		setIsSubmitLoading(true)
		const allDates = eachDayOfInterval({
			start: data.startDate,
			end: data.endDate,
		})
		const dates = allDates.map((date) => DateToDayISOstring(date))

		const res = await createScheduleAction({
			id: scheduleId,
			userId: session.user.id,
			title: data.title,
			description: data.description,
			dates: dates,
			mention: data.mention,
			timeExtended: data.isTimeExtended,
			deadline: DateToDayISOstring(data.deadline),
		})
		if (res.ok) {
			setIsPopupOpen(true)
		} else {
			setError(res)
		}

		setIsSubmitLoading(false)
	}

	return (
		<div className="flex flex-col items-center justify-center py-6 bg-white rounded-lg shadow-md">
			<h1 className="text-2xl font-bold">日程調整作成</h1>
			<form className="flex flex-col gap-y-2" onSubmit={handleSubmit(onSubmit)}>
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
						value="true"
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
						value="true"
						className="checkbox checkbox-primary"
					/>
					<span className="label-text text-base">メンションをオン</span>
				</label>
				<p className="text-sm">特定の部員とだけの予定を作成できます。</p>
				{isMentionChecked && (
					<SelectField
						name="mention"
						label="メンション"
						options={initialUsers} // Use initialUsers from props
						register={register('mention')}
						isMultiple={true}
						setValue={setValue}
						watchValue={watchMention}
						errorMessage={errors.mention?.message}
					/>
				)}
				<Controller
					name="startDate"
					control={control}
					render={({ field }) => (
						<CustomDatePicker
							label="開始日"
							selectedDate={field.value}
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
				<button
					className="btn btn-primary btn-md mt-4"
					type="submit"
					disabled={isSubmitLoading}
				>
					作成
				</button>
				<button
					className="btn btn-outline btn-md"
					onClick={() => router.back()}
				>
					戻る
				</button>
				{error && (
					<p className="text-sm text-error text-center">
						エラーコード{error.status}:{error.message}
					</p>
				)}
			</form>
			<Popup
				id={`schedule-create-popup-${scheduleId}`}
				title="日程調整作成完了"
				onClose={() => router.push('/schedule')}
				open={isPopupOpen}
			>
				<div>
					<p className="text-center">以下の内容で日程調整を作成しました。</p>
					<div className="my-4 px-4 space-y-2 text-left">
						<p>タイトル: {watchAll?.title}</p>
						<p>
							日程:
							{watchAll?.startDate
								? format(watchAll.startDate, 'yyyy/MM/dd(E)', { locale: ja })
								: '未入力'}{' '}
							-{' '}
							{watchAll?.endDate
								? format(watchAll.endDate, 'yyyy/MM/dd(E)', { locale: ja })
								: '未入力'}
						</p>
						<p>説明: {watchAll?.description || '未入力'}</p>
						<p>
							締め切り:
							{watchAll?.deadline
								? format(watchAll.deadline, 'yyyy/MM/dd(E)', { locale: ja })
								: '未入力'}
						</p>
						{watchAll?.isMentionChecked && (
							<p>
								メンション:{' '}
								{watchAll?.mention
									?.map((mention: string) => initialUsers[mention]) // Use initialUsers here as well
									.join(', ') || '未入力'}
							</p>
						)}
					</div>
					<div className="flex flex-row justify-center space-x-2">
						<ShareButton
							url={`${window.location.origin}/schedule/${scheduleId}`}
							title="日程調整を共有"
							text={`日程: ${format(
								watchAll.startDate || new Date(),
								'yyyy/MM/dd(E)',
								{
									locale: ja,
								},
							)} - ${format(watchAll.endDate || new Date(), 'yyyy/MM/dd(E)', {
								locale: ja,
							})}`}
							isFullButton
						/>
						<button
							className="btn btn-primary"
							onClick={() => router.push('/schedule')}
						>
							一覧に戻る
						</button>
					</div>
				</div>
			</Popup>
		</div>
	)
}

export default ScheduleCreatePage
