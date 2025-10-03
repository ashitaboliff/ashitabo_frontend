'use server'

import { notFound } from 'next/navigation'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'
import YoutubeManagement from '@/features/admin/components/YoutubeManage'
import {
	getAccessTokenAction,
	getPlaylistAction,
} from '@/features/video/components/actions'

const YoutubePage = async ({ session }: { session: Session }) => {
	const accessToken = await getAccessTokenAction()
	const playlist = await getPlaylistAction()
	if (playlist.status !== 200) {
		return notFound()
	}
	return (
		<YoutubeManagement
			playlists={playlist.response}
			isAccessToken={accessToken.status === 200}
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
