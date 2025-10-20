import Link from 'next/link'
import type { ReactNode } from 'react'
import { LuArrowRight } from '@/components/ui/icons'

const LinkWithArrow = ({
	href,
	children,
	className = '',
}: {
	href: string
	children: ReactNode
	className?: string
}) => {
	return (
		<Link href={href} className={`flex items-center w-full ${className}`}>
			<span className="mr-2">{children}</span>
			<LuArrowRight className="text-lg" />
		</Link>
	)
}

export default LinkWithArrow
