import { notFound } from 'next/navigation'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'
import YoutubeManagement from '@/features/admin/components/YoutubeManage'
import {
	getAccessTokenAction,
	getPlaylistAction,
} from '@/features/video/components/actions'
import { StatusCode } from '@/types/responseTypes'
import type { Session } from '@/types/session'

const YoutubePage = async ({ session }: { session: Session }) => {
	const accessToken = await getAccessTokenAction()
	const playlist = await getPlaylistAction()
	if (!playlist.ok) {
		return notFound()
	}
	return (
		<YoutubeManagement
			playlists={playlist.data}
			isAccessToken={accessToken.status === StatusCode.OK}
		/>
	)
}

const Page = async () => {
	return (
		<AuthPage requireProfile requireRole="ADMIN">
			{(authResult) => <YoutubePage session={authResult.session!} />}
		</AuthPage>
	)
}

export default Page
