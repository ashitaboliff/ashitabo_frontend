import {
	PiCircle as CircleIcon,
	HiMiniXMark as ForbiddenIcon,
} from '@/shared/ui/icons'

export const CALENDAR_CELL_CONTENT_CLASS =
	'w-11 h-12 sm:w-full sm:h-16 flex flex-col justify-center items-center text-center break-words overflow-hidden py-1'

const truncateWithEllipsis = (value: string, maxLength: number): string => {
	if (!value) return ''
	if (value.length <= maxLength) return value
	return `${value.slice(0, maxLength - 1)}...`
}

type BookingInfoCellProps = {
	registName: string
	name: string
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

type ForbiddenCellProps = {
	label?: string
}

export const ForbiddenCell = ({ label }: ForbiddenCellProps) => (
	<div className={CALENDAR_CELL_CONTENT_CLASS}>
		<ForbiddenIcon color="red" size={20} />
		{label ? (
			<p className="text-xxxs sm:text-xs-custom text-base-content">{label}</p>
		) : null}
	</div>
)

export const AvailableCell = () => (
	<div className={CALENDAR_CELL_CONTENT_CLASS}>
		<CircleIcon color="blue" size={20} />
	</div>
)
