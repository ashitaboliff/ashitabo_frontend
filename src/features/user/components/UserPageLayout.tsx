import type { ReactNode } from 'react'
import ProfileDisplay from '@/features/user/components/ProfileDisplay'
import type { Profile } from '@/features/user/types'
import type { Session } from '@/types/session'
import UserPageControls from './UserPageControls'

interface UserPageLayoutProps {
	session: Session
	profile: Profile | null
	children: ReactNode
}

const UserPageLayout = ({
	session,
	profile,
	children,
}: UserPageLayoutProps) => {
	return (
		<div className="container mx-auto p-4 flex flex-col items-center">
			<ProfileDisplay session={session} profile={profile} />
			<UserPageControls session={session}>{children}</UserPageControls>
		</div>
	)
}

export default UserPageLayout
