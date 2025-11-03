'use client'

import { useRouter } from 'next/navigation'
import type { CSSProperties } from 'react'
import type { AdFormat } from '@/shared/lib/ads'

interface MockAdSenseProps {
	adSlot: string
	adFormat?: AdFormat
	adStyle?: CSSProperties
	placement?: string
}

/**
 * 開発環境用のモック広告コンポーネント
 * クリックでページ遷移をテストできる
 */
const MockAdSense = ({
	adSlot,
	adFormat = 'auto',
	adStyle,
	placement,
}: MockAdSenseProps) => {
	const router = useRouter()

	// モック広告のバリエーション
	const mockAds = [
		{
			title: 'テスト広告 - ホーム',
			description: 'クリックでホームページに遷移',
			path: '/home',
			bgColor: 'bg-blue-100',
			borderColor: 'border-blue-300',
		},
		{
			title: 'テスト広告 - 予約',
			description: 'クリックで予約ページに遷移',
			path: '/booking',
			bgColor: 'bg-green-100',
			borderColor: 'border-green-300',
		},
		{
			title: 'テスト広告 - 動画',
			description: 'クリックで動画ページに遷移',
			path: '/video',
			bgColor: 'bg-purple-100',
			borderColor: 'border-purple-300',
		},
		{
			title: 'テスト広告 - スケジュール',
			description: 'クリックでスケジュールページに遷移',
			path: '/schedule',
			bgColor: 'bg-orange-100',
			borderColor: 'border-orange-300',
		},
	]

	// adSlotの数値からモック広告を選択（一貫性を保つため）
	const adIndex =
		Number.parseInt(adSlot.slice(-1)) % mockAds.length || mockAds.length - 1
	const mockAd = mockAds[adIndex]

	const handleClick = () => {
		console.log(
			`[MockAdSense] Navigating to ${mockAd.path} (slot: ${adSlot}, placement: ${placement})`,
		)
		router.push(mockAd.path)
	}

	// フォーマットに応じた高さを設定
	const getHeightClass = () => {
		switch (adFormat) {
			case 'rectangle':
				return 'h-64'
			case 'vertical':
				return 'h-96'
			case 'horizontal':
				return 'h-24'
			case 'fluid':
				return 'h-48'
			default:
				return 'h-32'
		}
	}

	return (
		<div
			className={`${mockAd.bgColor} ${mockAd.borderColor} border-2 rounded-lg ${getHeightClass()} cursor-pointer transition-all hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center p-4`}
			onClick={handleClick}
			style={adStyle}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					handleClick()
				}
			}}
		>
			<div className="text-center">
				<div className="text-xs text-gray-500 mb-2">
					[開発環境] モック広告
				</div>
				<div className="font-bold text-gray-800 mb-1">{mockAd.title}</div>
				<div className="text-sm text-gray-600">{mockAd.description}</div>
				<div className="text-xs text-gray-400 mt-2">
					Slot: {adSlot} | Format: {adFormat}
				</div>
				{placement && (
					<div className="text-xs text-gray-400">Placement: {placement}</div>
				)}
			</div>
		</div>
	)
}

export default MockAdSense
