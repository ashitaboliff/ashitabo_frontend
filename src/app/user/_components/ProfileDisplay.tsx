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
		<div className="mb-4 flex flex-row items-center justify-center gap-10 gap-4 rounded-lg p-4 shadow-md">
			<Image
				src={image}
				alt="ユーザーアイコン"
				width={150}
				height={150}
				className="h-32 w-32 rounded-full object-cover md:h-36 md:w-36"
				priority
			/>
			<div className="flex flex-col items-center justify-center space-y-2 md:items-start">
				<div className="font-bold text-2xl md:text-4xl">{displayName}</div>
				<div className="text-sm md:text-base">{RoleMap[role]}</div>
				<InstIcon part={parts} size={30} />
			</div>
		</div>
	)
}

export default ProfileDisplay
