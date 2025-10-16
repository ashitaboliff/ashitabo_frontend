import { notFound } from 'next/navigation'
import YoutubeManagement from '@/features/admin/components/YoutubeManage'
import { AuthPage } from '@/features/auth/components/UnifiedAuth'
import {
	getAccessTokenAction,
	getPlaylistAction,
} from '@/features/video/actions'
import { StatusCode } from '@/types/responseTypes'

const YoutubePage = async () => {
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
			{() => <YoutubePage />}
		</AuthPage>
	)
}

export default Page
