'use client'

import { useCallback, useMemo } from 'react'
import { CiShare1, IoShareSocialSharp } from '@/shared/ui/icons'
import {
	useNavigatorShare,
	useWindowAlert,
	useWindowOpen,
} from '@/shared/hooks/useBrowserApis'
import PublicEnv from '@/shared/lib/env/public'

type ShareButtonProps = {
	url: string
	title: string
	text: string
	isFullButton?: boolean
	className?: string
	isOnlyLine?: boolean
}

const ShareButton = ({
	url,
	title,
	text,
	isFullButton,
	className,
	isOnlyLine,
}: ShareButtonProps) => {
	const openWindow = useWindowOpen()
	const navigatorShare = useNavigatorShare()
	const alertUser = useWindowAlert()

	const lineShareUrl = useMemo(() => {
		return `https://social-plugins.line.me/lineit/share?url=${PublicEnv.NEXT_PUBLIC_APP_URL}${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
	}, [text, url])

	const shareData = useMemo(
		() => ({
			title,
			text,
			url,
		}),
		[text, title, url],
	)

	const handleShare = useCallback(async () => {
		if (isOnlyLine) {
			const result = openWindow(lineShareUrl, '_blank', 'noopener')
			if (!result) {
				alertUser(
					'別タブで共有画面を開けませんでした。ポップアップのブロックを確認してください。',
				)
			}
			return
		}

		try {
			await navigatorShare(shareData)
		} catch (_error) {
			const fallbackWindow = openWindow(lineShareUrl, '_blank', 'noopener')
			if (!fallbackWindow) {
				alertUser(
					'このブラウザは共有機能に対応していません。LINE共有リンクを開けませんでした。',
				)
			}
		}
	}, [
		alertUser,
		isOnlyLine,
		lineShareUrl,
		navigatorShare,
		openWindow,
		shareData,
	])

	const buttonClassName =
		className ||
		(isFullButton ? 'btn btn-outline w-full sm:w-auto' : 'btn btn-ghost')

	return (
		<button type="button" className={buttonClassName} onClick={handleShare}>
			{isFullButton ? (
				<div className="flex items-center justify-center">
					<CiShare1 size={15} />
					<span className="ml-2">{title}</span>
				</div>
			) : (
				<IoShareSocialSharp size={25} />
			)}
		</button>
	)
}

export default ShareButton
