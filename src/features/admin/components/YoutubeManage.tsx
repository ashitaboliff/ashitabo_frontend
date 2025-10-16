'use client'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useRouter } from 'next-nprogress-bar'
import { useCallback, useEffect, useRef, useState } from 'react'
import ErrorMessage from '@/components/ui/atoms/ErrorMessage'
import Pagination from '@/components/ui/atoms/Pagination'
import SelectField from '@/components/ui/atoms/SelectField'
import Tags from '@/components/ui/atoms/Tags'
import {
	createPlaylistAction,
	getAuthUrl,
	revalidateYoutubeTag,
} from '@/features/video/actions'
import type { Playlist } from '@/features/video/types'
import { useLocationNavigate } from '@/hooks/useBrowserApis'
import { useFeedback } from '@/hooks/useFeedback'
import { usePagedResource } from '@/hooks/usePagedResource'

interface YoutubeManagementProps {
	playlists: Playlist[] | undefined | null
	isAccessToken: boolean
}

const YoutubeManagement = ({
	playlists,
	isAccessToken,
}: YoutubeManagementProps) => {
	const router = useRouter()
	const actionFeedback = useFeedback()
	const navigate = useLocationNavigate()
	const [isLoading, setIsLoading] = useState(false)
	const [detailPlaylist, setDetailPlaylist] = useState<Playlist | null>(null)
	const detailDialogRef = useRef<HTMLDialogElement>(null)

	const {
		state: { page, perPage },
		pageCount,
		setPage,
		setPerPage,
		setTotalCount,
	} = usePagedResource<'default'>({
		initialPerPage: 10,
		initialSort: 'default',
	})

	useEffect(() => {
		setTotalCount(playlists?.length ?? 0)
	}, [playlists, setTotalCount])

	useEffect(() => {
		if (detailPlaylist) {
			detailDialogRef.current?.showModal()
		} else {
			detailDialogRef.current?.close()
		}
	}, [detailPlaylist])

	const indexOfLastPlaylist = page * perPage
	const indexOfFirstPlaylist = indexOfLastPlaylist - perPage
	const currentPlaylist =
		playlists?.slice(indexOfFirstPlaylist, indexOfLastPlaylist) ?? []

	const handleAuth = useCallback(async () => {
		actionFeedback.clearFeedback()
		const url = await getAuthUrl()
		if (url.ok) {
			navigate(url.data)
		} else {
			actionFeedback.showApiError(url)
		}
	}, [actionFeedback, navigate])

	const handleFetchPlaylist = useCallback(async () => {
		actionFeedback.clearFeedback()
		setIsLoading(true)
		const res = await createPlaylistAction()
		if (res.ok) {
			actionFeedback.showSuccess('プレイリストを取得しました。')
			router.refresh()
		} else {
			actionFeedback.showApiError(res)
		}
		setIsLoading(false)
	}, [actionFeedback, router])

	const handleRevalidate = useCallback(async () => {
		actionFeedback.clearFeedback()
		await revalidateYoutubeTag()
		actionFeedback.showSuccess('Youtubeのキャッシュを更新しました。')
	}, [actionFeedback])

	const closeDetailDialog = useCallback(() => {
		setDetailPlaylist(null)
	}, [])

	const lastUpdatedText = playlists?.[0]?.updatedAt
		? format(new Date(playlists[0].updatedAt), 'yyyy/MM/dd', { locale: ja })
		: '不明'

	return (
		<div className="flex flex-col items-center justify-center gap-y-2">
			<h1 className="text-2xl font-bold">Youtube動画管理</h1>
			<p className="text-sm text-center">
				このページではYoutubeに上がっている動画を取得できます。
				<br />
				Youtube認証が必要な場合があるため、あしたぼアカウントでログイン済みの方が操作してください。
			</p>
			<button
				type="button"
				className="btn btn-primary btn-outline"
				onClick={handleAuth}
				disabled={isAccessToken}
			>
				Youtube認証
			</button>
			<div className="flex flex-row gap-x-2">
				<button
					type="button"
					className="btn btn-primary"
					onClick={handleFetchPlaylist}
					disabled={isLoading}
				>
					{isLoading ? '処理中...' : 'Youtubeから取得'}
				</button>
				<button
					type="button"
					className="btn btn-secondary btn-outline"
					onClick={handleRevalidate}
				>
					更新
				</button>
			</div>
			<ErrorMessage message={actionFeedback.feedback} />

			<div className="overflow-x-auto w-full flex flex-col justify-center gap-y-2">
				<div className="flex flex-row items-center justify-between">
					<div className="text-sm">更新日: {lastUpdatedText}</div>
					<div className="flex flex-row items-center">
						<p className="text-sm whitespace-nowrap">表示件数:</p>
						<SelectField
							value={perPage}
							onChange={(e) => {
								const next = Number(e.target.value)
								setPerPage(next)
								setPage(1)
							}}
							options={{ '10件': 10, '20件': 20, '50件': 50, '100件': 100 }}
							name="playlistPerPage"
						/>
					</div>
				</div>
				<table className="table table-zebra table-sm w-full max-w-3xl self-center">
					<thead>
						<tr>
							<th>タイトル</th>
							<th>タグ</th>
						</tr>
					</thead>
					<tbody>
						{currentPlaylist.map((playlist) => (
							<tr
								key={playlist.playlistId}
								onClick={() => setDetailPlaylist(playlist)}
								className="cursor-pointer"
							>
								<td>{playlist.title}</td>
								<td>
									{playlist.tags ? <Tags tags={playlist.tags} /> : '未設定'}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<Pagination
				currentPage={page}
				totalPages={pageCount}
				onPageChange={(newPage) => setPage(newPage)}
			/>
			<div className="flex flex-row justify-center mt-2">
				<button
					type="button"
					className="btn btn-outline"
					onClick={() => router.push('/admin')}
				>
					戻る
				</button>
			</div>

			<dialog
				ref={detailDialogRef}
				className="modal"
				onClose={closeDetailDialog}
			>
				<div className="modal-box text-sm space-y-3">
					<h3 className="font-bold text-lg">プレイリスト詳細</h3>
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
									<a
										href={detailPlaylist.link}
										target="_blank"
										rel="noreferrer"
									>
										{detailPlaylist.link}
									</a>
								) : (
									'不明'
								)}
							</div>
						</div>
						<div className="flex gap-x-1">
							<div className="font-bold basis-1/4">タグ:</div>
							<div className="basis-3/4">
								{detailPlaylist?.tags ? (
									<Tags tags={detailPlaylist.tags} size="text-sm" />
								) : (
									'未設定'
								)}
							</div>
						</div>
						<div className="flex gap-x-1">
							<div className="font-bold basis-1/4">作成日:</div>
							<div className="basis-3/4">
								{detailPlaylist?.createdAt
									? format(
											new Date(detailPlaylist.createdAt),
											'yyyy年MM月dd日',
											{
												locale: ja,
											},
										)
									: '不明'}
							</div>
						</div>
						<div className="flex gap-x-1">
							<div className="font-bold basis-1/4">更新日:</div>
							<div className="basis-3/4">
								{detailPlaylist?.updatedAt
									? format(
											new Date(detailPlaylist.updatedAt),
											'yyyy年MM月dd日',
											{
												locale: ja,
											},
										)
									: '不明'}
							</div>
						</div>
					</div>
					<div className="flex justify-center">
						<button
							type="button"
							className="btn btn-primary"
							onClick={closeDetailDialog}
						>
							閉じる
						</button>
					</div>
				</div>
				<form method="dialog" className="modal-backdrop">
					<button type="button" onClick={closeDetailDialog}>
						close
					</button>
				</form>
			</dialog>
		</div>
	)
}

export default YoutubeManagement
