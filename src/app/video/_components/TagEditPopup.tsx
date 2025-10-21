'use client'

import { useRouter } from 'next-nprogress-bar'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { TbEdit } from '@/shared/ui/icons'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import Popup from '@/shared/ui/molecules/Popup'
import TagInputField from '@/shared/ui/molecules/TagsInputField'
import type { liveOrBand } from '@/domains/video/model/videoTypes'
import { useFeedback } from '@/shared/hooks/useFeedback'
import type { Session } from '@/types/session'
import { updateTagsAction } from '@/domains/video/api/videoActions'

interface Props {
	readonly session: Session | null
	readonly id: string
	readonly currentTags: string[] | undefined
	readonly liveOrBand: liveOrBand
	readonly isFullButton?: boolean
}

const TagEditPopup = ({
	session,
	id,
	currentTags,
	liveOrBand,
	isFullButton,
}: Props) => {
	const router = useRouter()
	const [isPopupOpen, setIsPopupOpen] = useState(false)
	const [isSessionPopupOpen, setIsSessionPopupOpen] = useState(false)
	const tagFeedback = useFeedback()

	const {
		handleSubmit,
		control,
		reset,
		formState: { isSubmitting },
	} = useForm<{
		tags: string[]
	}>({
		defaultValues: {
			tags: currentTags || [],
		},
	})

	useEffect(() => {
		reset({ tags: currentTags || [] })
	}, [currentTags, reset])

	const onSubmit = async (data: { tags: string[] }) => {
		tagFeedback.clearFeedback()
		if (!session) {
			tagFeedback.showError('ログインが必要です。')
			setIsSessionPopupOpen(true)
			return
		}
		const res = await updateTagsAction({
			userId: session.user.id,
			id,
			tags: data.tags,
			liveOrBand,
		})
		if (res.ok) {
			setIsPopupOpen(false)
			router.refresh()
		} else {
			tagFeedback.showApiError(res)
		}
	}

	const handleOpenEditPopup = () => {
		if (!session) {
			setIsSessionPopupOpen(true)
		} else {
			reset({ tags: currentTags || [] })
			tagFeedback.clearFeedback()
			setIsPopupOpen(true)
		}
	}

	return (
		<>
			<button
				className="btn btn-outline btn-primary btn-sm text-xs-custom xl:text-sm"
				onClick={handleOpenEditPopup}
				type="button"
			>
				<TbEdit size={15} />
				{isFullButton ? ' タグを編集' : ''}
			</button>
			<Popup
				id={`tag-edit-popup-${id}`}
				title="タグ編集"
				open={isPopupOpen}
				onClose={() => setIsPopupOpen(false)}
			>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="flex flex-col gap-y-3 justify-center max-w-sm m-auto"
				>
					<TagInputField
						name="tags"
						control={control}
						label="タグ"
						placeholder="タグを追加"
						defaultValue={currentTags || []}
					/>
					<div className="flex flex-row justify-center gap-x-2 mt-2">
						<button
							type="submit"
							className="btn btn-primary"
							disabled={isSubmitting}
						>
							{isSubmitting ? '更新中...' : '更新'}
						</button>
						<button
							type="button"
							className="btn btn-outline"
							onClick={() => setIsPopupOpen(false)}
							disabled={isSubmitting}
						>
							キャンセル
						</button>
					</div>
					<FeedbackMessage source={tagFeedback.feedback} />
				</form>
			</Popup>
			<Popup
				id={`session-popup-${id}`}
				title="利用登録が必要です"
				open={isSessionPopupOpen}
				onClose={() => setIsSessionPopupOpen(false)}
			>
				<div className="flex flex-col gap-y-3 justify-center max-w-sm m-auto text-center">
					<p className="text-sm">タグ編集を行うにはログインが必要です。</p>
					<div className="flex flex-row justify-center gap-x-2 mt-2">
						<button
							type="button"
							className="btn btn-primary"
							onClick={() => {
								setIsSessionPopupOpen(false)
								router.push('/auth/signin')
							}}
						>
							ログイン
						</button>
						<button
							type="button"
							className="btn btn-outline"
							onClick={() => setIsSessionPopupOpen(false)}
						>
							閉じる
						</button>
					</div>
				</div>
			</Popup>
		</>
	)
}

export default TagEditPopup
