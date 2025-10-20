'use client'

import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import TextInputField from '@/components/ui/atoms/TextInputField'
import { MdOutlineEditCalendar } from '@/components/ui/icons'
import { BookingErrorMessage } from '@/features/booking/components/BookingActionFeedback'
import { BOOKING_TIME_LIST } from '@/features/booking/constants'
import type { BookingEditFormValues } from '@/features/booking/schema'
import type { FeedbackMessageType } from '@/types/feedback'

type Props = {
	register: UseFormRegister<BookingEditFormValues>
	errors: FieldErrors<BookingEditFormValues>
	isSubmitting: boolean
	isLoading: boolean
	onCancel: () => void
	onOpenCalendar: () => void
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
	errorFeedback: FeedbackMessageType | null
	bookingTimeIndex: number
}

const BookingEditFormFields = ({
	register,
	errors,
	isSubmitting,
	isLoading,
	onCancel,
	onOpenCalendar,
	onSubmit,
	errorFeedback,
	bookingTimeIndex,
}: Props) => (
	<>
		<input
			type="hidden"
			{...register('bookingTime', { valueAsNumber: true })}
		/>
		<form onSubmit={onSubmit} className="space-y-2 p-4">
			<div className="flex flex-row justify-between gap-2">
				<div className="flex flex-col space-y-2 grow">
					<TextInputField
						label="日付"
						register={register('bookingDate')}
						placeholder="日付"
						type="text"
						disabled
					/>
					<TextInputField
						label="時間"
						placeholder="時間"
						type="text"
						value={BOOKING_TIME_LIST[bookingTimeIndex] ?? ''}
						disabled
					/>
				</div>
				<div className="flex flex-col items-center justify-center">
					<button
						type="button"
						className="btn btn-primary btn-circle btn-outline"
						onClick={onOpenCalendar}
						disabled={isLoading}
					>
						<MdOutlineEditCalendar size={25} />
					</button>
				</div>
			</div>
			<TextInputField
				label="バンド名"
				register={register('registName')}
				placeholder="バンド名"
				type="text"
				errorMessage={errors.registName?.message}
			/>
			<TextInputField
				label="責任者"
				register={register('name')}
				placeholder="責任者名"
				type="text"
				errorMessage={errors.name?.message}
			/>

			<div className="flex justify-center space-x-4">
				<button
					type="submit"
					className="btn btn-primary"
					disabled={isSubmitting || isLoading}
				>
					{isSubmitting || isLoading ? '処理中...' : '予約を更新する'}
				</button>
				<button
					type="button"
					className="btn btn-outline"
					onClick={onCancel}
					disabled={isLoading}
				>
					戻る
				</button>
			</div>
		</form>
		<BookingErrorMessage feedback={errorFeedback} />
	</>
)

export default BookingEditFormFields
