import Image from 'next/image'
import { type Profile, RoleMap } from '@/domains/user/model/userTypes'
import InstIcon from '@/shared/ui/atoms/InstIcon'
import type { Session } from '@/types/session'

interface Props {
	readonly session: Session
	readonly profile: Profile | null
}

const ProfileDisplay = ({ session, profile }: Props) => {
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
				priority
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
