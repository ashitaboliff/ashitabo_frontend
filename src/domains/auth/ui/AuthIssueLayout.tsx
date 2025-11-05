import type { ReactNode } from 'react'

interface Props {
	readonly title: string
	readonly message: ReactNode
	readonly details?: ReactNode
	readonly code?: string | null
	readonly actions?: ReactNode
	readonly icon?: ReactNode
	readonly className?: string
	readonly children?: ReactNode
}

const AuthIssueLayout = ({
	title,
	message,
	details,
	code,
	actions,
	icon,
	className = '',
	children,
}: Props) => {
	return (
		<div className={`flex items-center justify-center p-4 ${className}`.trim()}>
			<div className="card w-full max-w-xl bg-base-100 shadow-xl">
				<div className="card-body gap-6 text-center">
					<div className="flex flex-col items-center gap-4">
						{icon ? <div className="text-5xl text-primary">{icon}</div> : null}
						<div>
							<h1 className="mb-2 font-bold text-2xl text-base-content">
								{title}
							</h1>
							<div className="whitespace-pre-line text-base text-base-content/80">
								{message}
							</div>
							{details ? (
								<p className="mt-4 whitespace-pre-line text-base-content/60 text-sm">
									{details}
								</p>
							) : null}
							{code ? (
								<p className="mt-2 font-mono text-base-content/50 text-xs">
									エラーコード: {code}
								</p>
							) : null}
						</div>
					</div>
					{children}
					{actions ? (
						<div className="card-actions flex flex-col justify-center gap-3 sm:flex-row">
							{actions}
						</div>
					) : null}
				</div>
			</div>
		</div>
	)
}

export default AuthIssueLayout
