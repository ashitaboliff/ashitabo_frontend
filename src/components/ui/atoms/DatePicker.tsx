'use client'

import { useId } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ja } from 'date-fns/locale'
import { registerLocale } from 'react-datepicker'
import CustomHeader from '@/components/ui/atoms/DatePickerCustumHeader'
import InputFieldError from '@/components/ui/atoms/InputFieldError'

registerLocale('ja', ja)

const CustomDatePicker = ({
	label,
	selectedDate,
	onChange,
	minDate,
	errorMessage,
}: {
	label?: string
	selectedDate: Date | null
	onChange: (dates: Date | null) => void
	minDate?: Date
	errorMessage?: string
}) => {
	const inputId = useId()

	return (
		<div className="flex flex-col w-full">
			{label && (
				<label className="label" htmlFor={inputId}>
					{label}
				</label>
			)}
			<DatePicker
				id={inputId}
				selected={selectedDate}
				onChange={onChange}
				locale="ja"
				withPortal
				renderCustomHeader={(props) => (
					<CustomHeader
						{...props}
						changeYear={(value: number) => props.changeYear(value)}
						changeMonth={(value: number) => props.changeMonth(value)}
					/>
				)}
				minDate={minDate}
				dateFormat="yyyy/MM/dd"
				className="border border-base-300 rounded-md p-2 w-full bg-white"
				calendarClassName="bg-white"
			/>
			<InputFieldError errorMessage={errorMessage} />
		</div>
	)
}

export default CustomDatePicker
