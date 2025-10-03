'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSession } from '@/features/auth/hooks/useSession'

import { FaRegUserCircle } from 'react-icons/fa'

const HeaderIcon = () => {
	const { data: session } = useSession()

	return (
		// <div className="w-10 h-10 skeleton rounded-full"></div>
		<Link href="/user" className="btn btn-square btn-ghost text-3xl">
			{session?.user?.image ? (
				<Image
					src={session.user.image}
					alt="user icon"
					width={40}
					height={40}
					className="rounded-full"
				/>
			) : (
				<FaRegUserCircle />
			)}
		</Link>
	)
}

export default HeaderIcon
