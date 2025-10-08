import IconFactory from '@/utils/IconFactory'
import { ReactNode } from 'react'

type Message = {
	messageType: 'info' | 'success' | 'error' | 'warning'
	message: string | ReactNode
	IconColor?: string
}

/**
 * メッセージを表示するためのコンポーネント
 * @param messageType メッセージの種類
 * @param message メッセージの内容
 * @param IconColor アイコンの色
 */
const InfoMessage = ({ messageType, message, IconColor }: Message) => {
	const iconColor = IconColor ?? messageType
	let className = ''
	switch (
		messageType // 冗長だけどこうしなきゃ色が反映されない
	) {
		case 'info':
			className = 'alert alert-info w-auto'
			break
		case 'success':
			className = 'alert alert-success w-auto'
			break
		case 'error':
			className = 'alert alert-error w-auto'
			break
		case 'warning':
			className = 'alert alert-warning w-auto'
			break
		default:
			className = ''
			break
	}
	return (
		<div
			className={`${className} flex flex-row items-center p-3 rounded-lg shadow-md`}
		>
			{' '}
			{/* Added items-center, padding, rounded corners, and shadow */}
			<div className="flex-shrink-0 mr-3">
				{' '}
				{/* Added margin to the icon container */}
				{IconFactory.getIcon({ color: iconColor, type: messageType })}
			</div>
			<span className="text-sm text-base-content flex-grow">{message}</span>{' '}
			{/* Added flex-grow to message span */}
		</div>
	)
}

export default InfoMessage
