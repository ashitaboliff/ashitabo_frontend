import type { ReactNode } from 'react'
import IconFactory from '@/utils/IconFactory'

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
						{IconFactory.getIcon({ color: 'info', type: 'info' })}
					</button>
					<div className="card dropdown-content card-sm w-48 bg-white shadow rounded-box p-2 z-10">
						<p className="text-sm">{infoDropdown}</p>
					</div>
				</div>
			)}
		</label>
	)
}

export default LabelInputField
