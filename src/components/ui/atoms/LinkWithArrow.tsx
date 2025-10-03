import { ReactNode } from 'react'
import Link from 'next/link'
import { LuArrowRight } from 'react-icons/lu'

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
