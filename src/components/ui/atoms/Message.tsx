import type { ReactNode } from 'react'
import {
	ErrorIcon,
	InfoIcon,
	SuccessIcon,
	WarningIcon,
} from '@/components/ui/icons'

export type MessageVariant = 'info' | 'success' | 'warning' | 'error'

interface MessageProps {
	variant?: MessageVariant
	showIcon?: boolean
	icon?: ReactNode
	iconClassName?: string
	title?: ReactNode
	children?: ReactNode
	className?: string
	role?: 'alert' | 'status'
}

const variantToClass: Record<MessageVariant, string> = {
	info: 'bg-info/10 text-info border-info/40',
	success: 'bg-success/10 text-success border-success/40',
	warning: 'bg-warning/10 text-warning border-warning/40',
	error: 'bg-error/10 text-error border-error/40',
}

const variantToIcon: Record<MessageVariant, ReactNode> = {
	info: <InfoIcon className="h-4 w-4" aria-hidden="true" />,
	success: <SuccessIcon className="h-4 w-4" aria-hidden="true" />,
	warning: <WarningIcon className="h-4 w-4" aria-hidden="true" />,
	error: <ErrorIcon className="h-4 w-4" aria-hidden="true" />,
}

const Message = ({
	variant = 'info',
	showIcon = true,
	icon,
	iconClassName,
	title,
	children,
	className,
	role,
}: MessageProps) => {
	if (!children && !title) {
		return null
	}

	return (
		<div className={`relative ${className ?? ''}`.trim()}>
			<div
				className="pointer-events-none absolute inset-0 rounded-md bg-white"
				aria-hidden="true"
			/>
			<div
				className={`relative z-10 flex items-start gap-3 rounded-md border px-3 py-2 text-sm ${variantToClass[variant]}`.trim()}
				role={role ?? (variant === 'error' ? 'alert' : 'status')}
			>
				{showIcon ? (
					<span className={`mt-0.5 ${iconClassName ?? ''}`.trim()}>
						{icon ?? variantToIcon[variant]}
					</span>
				) : null}
				<div className="flex-1 space-y-1">
					{title ? <p className="font-semibold">{title}</p> : null}
					{children}
				</div>
			</div>
		</div>
	)
}

export default Message
