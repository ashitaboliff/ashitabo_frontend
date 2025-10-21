import type { ReactNode } from 'react'
import ProfileDisplay from '@/app/user/_components/ProfileDisplay'
import type { Profile } from '@/domains/user/model/userTypes'
import type { Session } from '@/types/session'
import UserPageControls from './UserPageControls'

interface Props {
	readonly session: Session
	readonly profile: Profile | null
	readonly children: ReactNode
}

const UserPageLayout = ({ session, profile, children }: Props) => {
	return (
		<div className="container mx-auto p-4 flex flex-col items-center">
			<ProfileDisplay session={session} profile={profile} />
			<UserPageControls session={session}>{children}</UserPageControls>
		</div>
	)
}

export default UserPageLayout
