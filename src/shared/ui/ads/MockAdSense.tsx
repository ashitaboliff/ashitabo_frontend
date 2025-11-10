'use client'

import { useRouter } from 'next/navigation'
import type { CSSProperties } from 'react'
import type { AdFormat } from '@/shared/lib/ads'

interface MockAdSenseProps {
	adSlot: string
	adFormat?: AdFormat
	adStyle?: CSSProperties
	adLayout?: string
	adLayoutKey?: string
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
	adLayout,
	adLayoutKey,
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
		Number.parseInt(adSlot.slice(-1), 10) % mockAds.length || mockAds.length - 1
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
		<button
			type="button"
			className={`${mockAd.bgColor} ${mockAd.borderColor} rounded-lg border-2 ${getHeightClass()} flex cursor-pointer flex-col items-center justify-center p-4 transition-all hover:scale-105 hover:shadow-lg`}
			onClick={handleClick}
			style={adStyle}
		>
			<div className="text-center">
				<div className="mb-2 text-gray-500 text-xs">[開発環境] モック広告</div>
				<div className="mb-1 font-bold text-gray-800">{mockAd.title}</div>
				<div className="text-gray-600 text-sm">{mockAd.description}</div>
				<div className="mt-2 text-gray-400 text-xs">
					Slot: {adSlot} | Format: {adFormat}
				</div>
				{placement && (
					<div className="text-gray-400 text-xs">Placement: {placement}</div>
				)}
				{adLayout && (
					<div className="text-gray-400 text-xs">Layout: {adLayout}</div>
				)}
				{adLayoutKey && (
					<div className="text-gray-400 text-xs">Layout Key: {adLayoutKey}</div>
				)}
			</div>
		</button>
	)
}

export default MockAdSense
