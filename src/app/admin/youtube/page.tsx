import { notFound } from 'next/navigation'
import YoutubeManagement from '@/app/admin/youtube/_components'
import { AuthPage } from '@/domains/auth/ui/UnifiedAuth'
import { getPlaylistAction } from '@/domains/video/api/videoActions'

const YoutubePage = async () => {
	const playlist = await getPlaylistAction()
	if (!playlist.ok) {
		return notFound()
	}
	return <YoutubeManagement playlists={playlist.data} />
}

const Page = async () => {
	return (
		<AuthPage requireProfile requireRole="ADMIN">
			{() => <YoutubePage />}
		</AuthPage>
	)
}

export default Page
