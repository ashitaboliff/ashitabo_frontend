'use client'

import Image from 'next/image'
import InstIcon from '@/components/ui/atoms/InstIcon'
import { type Profile, RoleMap } from '@/features/user/types'
import type { Session } from '@/types/session'

const ProfileDisplay = ({
	session,
	profile,
}: {
	session: Session
	profile: Profile | null
}) => {
	const role = profile?.role ?? 'STUDENT'
	const parts = profile?.part ?? []
	const displayName = profile?.name ?? session.user.name
	const image = session.user.image ?? '/default-icon.png'

	return (
		<div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-10 mb-4 p-6 bg-base-100 rounded-lg shadow-md">
			<Image
				src={image}
				alt="ユーザーアイコン"
				width={150}
				height={150}
				className="rounded-full object-cover w-24 h-24 md:w-36 md:h-36"
			/>
			<div className="flex flex-col items-center md:items-start justify-center">
				<div className="text-2xl md:text-4xl font-bold">{displayName}</div>
				<div className="text-sm md:text-base">{RoleMap[role]}</div>
				<InstIcon part={parts} size={30} />
			</div>
		</div>
	)
}

export default ProfileDisplay
