import { HiMiniXMark, PiCircle } from '@/shared/ui/icons'

export const CALENDAR_CELL_CONTENT_CLASS =
	'w-11 h-12 sm:w-full sm:h-16 flex flex-col justify-center items-center text-center break-words overflow-hidden py-1'

const truncateWithEllipsis = (value: string, maxLength: number): string => {
	if (!value) return ''
	if (value.length <= maxLength) return value
	return `${value.slice(0, maxLength - 1)}...`
}

interface BookingInfoCellProps {
	readonly registName: string
	readonly name: string
}

export const BookingInfoCell = ({ registName, name }: BookingInfoCellProps) => (
	<div className={CALENDAR_CELL_CONTENT_CLASS}>
		<p className="text-xxxs sm:text-xs-custom text-base-content font-bold">
			{truncateWithEllipsis(registName, 21)}
		</p>
		<p className="text-xxxs sm:text-xs-custom text-base-content">
			{truncateWithEllipsis(name, 14)}
		</p>
	</div>
)

interface DeniedCellProps {
	readonly label?: string
}

export const DeniedCell = ({ label }: DeniedCellProps) => (
	<div className={CALENDAR_CELL_CONTENT_CLASS}>
		<HiMiniXMark color="red" size={20} />
		{label ? (
			<p className="text-xxxs sm:text-xs-custom text-base-content">{label}</p>
		) : null}
	</div>
)

export const AvailableCell = () => (
	<div className={CALENDAR_CELL_CONTENT_CLASS}>
		<PiCircle color="blue" size={20} />
	</div>
)
