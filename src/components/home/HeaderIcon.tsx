'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FaRegUserCircle } from 'react-icons/fa'
import { useSession } from '@/features/auth/hooks/useSession'

const HeaderIcon = () => {
	const { data: session } = useSession()

	return (
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
