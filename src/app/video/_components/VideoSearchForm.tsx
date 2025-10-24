'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { type FormEvent, useId, useState } from 'react'
import type { YoutubeSearchQuery } from '@/domains/video/model/videoTypes'
import ShareButton from '@/shared/ui/atoms/ShareButton'
import { BiSearch, RiQuestionLine } from '@/shared/ui/icons'
import Popup from '@/shared/ui/molecules/Popup'
import TextSearchField from '@/shared/ui/molecules/TextSearchField'

interface Props {
	defaultQuery: YoutubeSearchQuery
	isSearching: boolean
	onSearch: (query: Partial<YoutubeSearchQuery>) => void
}

const VideoSearchForm = ({ defaultQuery, isSearching, onSearch }: Props) => {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const [isPopupOpen, setIsPopupOpen] = useState(false)
	const [isUsagePopupOpen, setIsUsagePopupOpen] = useState(false)
	const [formKey, setFormKey] = useState<number>(0)
	const searchPopupId = useId()
	const usagePopupId = useId()

	const getCurrentQuery = (): YoutubeSearchQuery => {
		const params = new URLSearchParams(searchParams.toString())
		return {
			liveOrBand:
				(params.get('liveOrBand') as 'live' | 'band') ??
				defaultQuery.liveOrBand,
			bandName: params.get('bandName') ?? defaultQuery.bandName,
			liveName: params.get('liveName') ?? defaultQuery.liveName,
			sort: (params.get('sort') as 'new' | 'old') ?? defaultQuery.sort,
			page: Number(params.get('page')) || defaultQuery.page,
			videoPerPage:
				Number(params.get('videoPerPage')) || defaultQuery.videoPerPage,
		}
	}

	const currentQuery = getCurrentQuery()

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		setIsPopupOpen(false)
		event.preventDefault()
		const formData = new FormData(event.currentTarget)
		const newQuery: Partial<YoutubeSearchQuery> = {
			liveOrBand: formData.get('liveOrBand') as 'live' | 'band',
			bandName: formData.get('bandName') as string,
			liveName: formData.get('liveName') as string,
		}
		onSearch({ ...newQuery, page: 1 })
	}

	const handleReset = () => {
		setFormKey((prev) => prev + 1)
		setIsPopupOpen(false)
		router.replace('/video')
		onSearch(defaultQuery)
	}

	return (
		<>
			<div className="flex flex-row items-center justify-center gap-x-2 py-2">
				<button
					className="btn btn-ghost w-16"
					onClick={() => setIsUsagePopupOpen(true)}
					type="button"
				>
					<RiQuestionLine size={25} />
				</button>
				<button
					className={`btn btn-outline w-64 ${isSearching ? 'btn-tetiary' : ''}`}
					onClick={() => setIsPopupOpen(true)}
					type="button"
				>
					<div className="flex flex-row items-center space-x-2">
						<BiSearch size={25} />
						条件検索
					</div>
				</button>
				<ShareButton
					title="ライブ映像をシェアする"
					text="あしたぼライブ映像を共有しよう"
					url={`${pathname}?${searchParams.toString()}`}
				/>
			</div>
			<Popup
				id={searchPopupId}
				title="条件検索"
				open={isPopupOpen}
				onClose={() => setIsPopupOpen(false)}
			>
				<form
					key={formKey}
					onSubmit={handleSubmit}
					className="flex flex-col gap-y-2 justify-center max-w-sm m-auto"
				>
					<div className="flex flex-row justify-center gap-x-2">
						<input
							type="radio"
							name="liveOrBand"
							value="live"
							defaultChecked={currentQuery.liveOrBand === 'live'}
							className={`btn w-5/12 checked:btn-accent btn-outline`}
							aria-label="再生リスト"
						/>
						<input
							type="radio"
							name="liveOrBand"
							value="band"
							defaultChecked={currentQuery.liveOrBand === 'band'}
							className={`btn w-5/12 checked:btn-accent btn-outline`}
							aria-label="動画"
						/>
					</div>
					<TextSearchField
						label="バンド名"
						infoDropdown="Youtubeの動画タイトルになっているバンド名での検索です"
						name="bandName"
						placeholder="バンド名"
						defaultValue={currentQuery.bandName}
					/>
					<TextSearchField
						label="ライブ名"
						infoDropdown="Youtubeのプレイリストタイトルになっているライブ名での検索です"
						name="liveName"
						placeholder="ライブ名"
						defaultValue={currentQuery.liveName}
					/>
					<button type="submit" className="btn btn-primary mt-2">
						検索
					</button>
					<div className="flex flex-row justify-center gap-x-2">
						<button
							type="button"
							className="btn btn-outline w-1/2"
							onClick={handleReset}
						>
							リセット
						</button>
						<button
							type="button"
							className="btn btn-outline w-1/2"
							onClick={() => setIsPopupOpen(false)}
						>
							閉じる
						</button>
					</div>
				</form>
			</Popup>
			<Popup
				id={usagePopupId}
				title="条件検索の使い方"
				open={isUsagePopupOpen}
				onClose={() => setIsUsagePopupOpen(false)}
			>
				<div className="flex flex-col gap-y-2">
					<div className="text-base gap">
						<div className="my-2">
							<p className="font-bold text-lg">ライブ名: </p>
							Youtubeのプレイリストタイトルになっているライブ名での検索です
						</div>
						<div className="my-2">
							<p className="font-bold text-lg">バンド名: </p>
							Youtubeの動画タイトルになっているバンド名での検索です
						</div>
						<div className="my-2">
							<p className="font-bold text-lg">タグ: </p>
							みんなのつけたタグによる検索です。自分の名前やバンドの正式名称、
							「<span className="text-info">#わたべのお気に入り</span>
							」など好きな名前をつけて共有してみるといいです
						</div>
					</div>
					<div className="flex flex-row justify-center gap-x-2">
						<button
							type="button"
							className="btn btn-outline"
							onClick={() => setIsUsagePopupOpen(false)}
						>
							閉じる
						</button>
					</div>
				</div>
			</Popup>
		</>
	)
}

export default VideoSearchForm
