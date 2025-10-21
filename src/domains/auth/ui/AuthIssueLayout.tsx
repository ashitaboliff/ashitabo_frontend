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
				<div className="card-body text-center gap-6">
					<div className="flex flex-col items-center gap-4">
						{icon ? <div className="text-5xl text-primary">{icon}</div> : null}
						<div>
							<h1 className="text-2xl font-bold text-base-content mb-2">
								{title}
							</h1>
							<div className="text-base text-base-content/80 whitespace-pre-line">
								{message}
							</div>
							{details ? (
								<p className="mt-4 text-sm text-base-content/60 whitespace-pre-line">
									{details}
								</p>
							) : null}
							{code ? (
								<p className="mt-2 text-xs font-mono text-base-content/50">
									エラーコード: {code}
								</p>
							) : null}
						</div>
					</div>
					{children}
					{actions ? (
						<div className="card-actions flex flex-col sm:flex-row justify-center gap-3">
							{actions}
						</div>
					) : null}
				</div>
			</div>
		</div>
	)
}

export default AuthIssueLayout
