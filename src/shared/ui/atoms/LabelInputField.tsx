import type { ReactNode } from 'react'
import { InfoIcon } from '@/shared/ui/icons'

const LabelInputField = ({
	label,
	labelId,
	infoDropdown,
}: {
	label: string
	labelId?: string
	infoDropdown?: ReactNode
}) => {
	return (
		<label
			className="label flex flex-row justify-start gap-2"
			htmlFor={labelId}
		>
			{label}
			{infoDropdown && (
				<div className="dropdown dropdown-right">
					<button
						type="button"
						tabIndex={0}
						className="btn btn-ghost btn-xs p-0"
						aria-label="追加情報"
					>
						<InfoIcon className="h-4 w-4" aria-hidden="true" />
					</button>
					<div className="card dropdown-content card-sm z-10 w-48 rounded-box bg-white p-2 shadow">
						<p className="text-sm">{infoDropdown}</p>
					</div>
				</div>
			)}
		</label>
	)
}

export default LabelInputField
