'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { postSyncPlaylistAction } from '@/domains/video/api/videoActions'
import { useYoutubeSearchQuery } from '@/domains/video/hooks/useYoutubeSearchQuery'
import type {
	PlaylistDoc,
	YoutubeSearchQuery,
} from '@/domains/video/model/videoTypes'
import { useFeedback } from '@/shared/hooks/useFeedback'
import Pagination from '@/shared/ui/atoms/Pagination'
import SelectField from '@/shared/ui/atoms/SelectField'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import Popup from '@/shared/ui/molecules/Popup'
import { formatDateJa, formatDateSlash } from '@/shared/utils/dateFormat'
import type { ApiError } from '@/types/response'

interface Props {
	readonly playlists: PlaylistDoc[]
	readonly total: number
	readonly defaultQuery: YoutubeSearchQuery
	readonly initialQuery: YoutubeSearchQuery
	readonly extraSearchParams?: string
	readonly error?: ApiError
}

const perPageOptions = {
	'10件': 10,
	'20件': 20,
	'50件': 50,
	'100件': 100,
} as const

const YoutubeManagement = ({
	playlists,
	total,
	defaultQuery,
	initialQuery,
	extraSearchParams,
	error,
}: Props) => {
	const router = useRouter()
	const actionFeedback = useFeedback()
	const [isLoading, setIsLoading] = useState(false)
	const [detailPlaylist, setDetailPlaylist] = useState<PlaylistDoc | null>(null)

	const { query, updateQuery, isPending } = useYoutubeSearchQuery({
		defaultQuery,
		initialQuery,
		extraSearchParams,
	})

	const totalPages = useMemo(() => {
		if (query.videoPerPage <= 0) return 1
		return Math.max(1, Math.ceil(total / query.videoPerPage) || 1)
	}, [query.videoPerPage, total])

	const handleFetchPlaylist = useCallback(async () => {
		actionFeedback.clearFeedback()
		setIsLoading(true)
		const res = await postSyncPlaylistAction()
		if (res.ok) {
			actionFeedback.showSuccess('プレイリストを取得しました。')
			router.refresh()
		} else {
			actionFeedback.showApiError(res)
		}
		setIsLoading(false)
	}, [actionFeedback, router])

	const closeDetail = useCallback(() => {
		setDetailPlaylist(null)
	}, [])

	const lastUpdatedText =
		playlists.length > 0 && playlists[0].updatedAt
			? formatDateSlash(playlists[0].updatedAt)
			: '不明'

	const isBusy = isLoading || isPending

	return (
		<div className="flex flex-col items-center justify-center gap-y-2">
			<h1 className="text-2xl font-bold">Youtube動画管理</h1>
			<p className="text-sm text-center">
				このページではあしたぼホームページとYoutubeの非公開動画の同期・管理を行えます。
			</p>
			<div className="flex flex-row gap-x-2">
				<button
					type="button"
					className="btn btn-primary"
					onClick={handleFetchPlaylist}
					disabled={isLoading}
				>
					{isLoading ? '処理中...' : 'Youtubeと同期'}
				</button>
			</div>
			<FeedbackMessage source={actionFeedback.feedback} />
			<FeedbackMessage source={error} />

			<div className="overflow-x-auto w-full flex flex-col justify-center gap-y-2">
				<div className="flex flex-col gap-y-2 sm:flex-row sm:items-center sm:justify-between">
					<div className="text-sm">更新日: {lastUpdatedText}</div>
					<div className="flex flex-row items-center">
						<p className="text-sm whitespace-nowrap mr-2">表示件数:</p>
						<SelectField
							value={query.videoPerPage}
							onChange={(e) =>
								updateQuery({
									videoPerPage: Number(e.target.value),
									page: 1,
								})
							}
							options={perPageOptions}
							name="playlistPerPage"
							disabled={isBusy}
						/>
					</div>
				</div>
				<table className="table table-zebra table-sm w-full max-w-3xl self-center">
					<thead>
						<tr>
							<th>タイトル</th>
						</tr>
					</thead>
					<tbody>
						{playlists.length === 0 ? (
							<tr>
								<td className="text-center py-4">
									プレイリストが見つかりませんでした。
								</td>
							</tr>
						) : (
							playlists.map((playlist) => (
								<tr
									key={playlist.playlistId}
									onClick={() => setDetailPlaylist(playlist)}
									className="cursor-pointer"
								>
									<td>{playlist.title}</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
			{totalPages > 1 ? (
				<Pagination
					currentPage={query.page}
					totalPages={totalPages}
					onPageChange={(page) => updateQuery({ page })}
				/>
			) : null}
			<div className="flex flex-row justify-center mt-2">
				<button
					type="button"
					className="btn btn-outline"
					onClick={() => router.push('/admin')}
					disabled={isBusy}
				>
					戻る
				</button>
			</div>

			<Popup
				id="youtube-playlist-detail"
				title="プレイリスト詳細"
				open={detailPlaylist !== null}
				onClose={closeDetail}
				className="text-sm"
			>
				<div className="space-y-2">
					<div className="flex gap-x-1">
						<div className="font-bold basis-1/4">プレイリストID:</div>
						<div className="basis-3/4 break-all">
							{detailPlaylist?.playlistId ?? '不明'}
						</div>
					</div>
					<div className="flex gap-x-1">
						<div className="font-bold basis-1/4">タイトル:</div>
						<div className="basis-3/4">{detailPlaylist?.title ?? '不明'}</div>
					</div>
					<div className="flex gap-x-1">
						<div className="font-bold basis-1/4">リンク:</div>
						<div className="basis-3/4 break-all">
							{detailPlaylist?.link ? (
								<a href={detailPlaylist.link} target="_blank" rel="noreferrer">
									{detailPlaylist.link}
								</a>
							) : (
								'不明'
							)}
						</div>
					</div>
					<div className="flex gap-x-1">
						<div className="font-bold basis-1/4">作成日:</div>
						<div className="basis-3/4">
							{detailPlaylist?.createdAt
								? formatDateJa(detailPlaylist.createdAt)
								: '不明'}
						</div>
					</div>
					<div className="flex gap-x-1">
						<div className="font-bold basis-1/4">更新日:</div>
						<div className="basis-3/4">
							{detailPlaylist?.updatedAt
								? formatDateJa(detailPlaylist.updatedAt)
								: '不明'}
						</div>
					</div>
				</div>
				<div className="flex justify-center mt-4">
					<button
						type="button"
						className="btn btn-primary"
						onClick={closeDetail}
					>
						閉じる
					</button>
				</div>
			</Popup>
		</div>
	)
}

export default YoutubeManagement
