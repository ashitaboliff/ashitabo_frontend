'use client'

import { useRouter } from 'next-nprogress-bar'
import { useCallback, useEffect, useState } from 'react'
import { MAX_GACHA_PLAYS_PER_DAY } from '@/features/gacha/config'
import { getCurrentJSTDateString } from '@/utils'

interface UseGachaPlayManagerOptions {
	onGachaPlayed?: () => void
}

/**
 * ユーザーのガチャ実行回数と制限を管理し、ローカルストレージとUI状態の同期を担うフック。
 * 成功時に任意のコールバックやルーターの再検証も行う。
 */
export const useGachaPlayManager = (options?: UseGachaPlayManagerOptions) => {
	const router = useRouter()
	const [gachaPlayCountToday, setGachaPlayCountToday] = useState<number>(0)
	const [_lastGachaDateString, setLastGachaDateString] = useState<string>('')
	const [gachaMessage, setGachaMessage] = useState<string>('')
	const [isGachaSelectPopupOpen, setIsGachaSelectPopupOpen] =
		useState<boolean>(false)

	useEffect(() => {
		const today = getCurrentJSTDateString({})
		const storedDate = localStorage.getItem('gachaLastPlayedDate')
		const storedCount = parseInt(
			localStorage.getItem('gachaPlayCountToday') || '0',
			10,
		)

		if (storedDate === today) {
			setGachaPlayCountToday(storedCount)
		} else {
			localStorage.setItem('gachaPlayCountToday', '0')
			localStorage.setItem('gachaLastPlayedDate', today)
			setGachaPlayCountToday(0)
		}
		setLastGachaDateString(today)
	}, [])

	const canPlayGacha = gachaPlayCountToday < MAX_GACHA_PLAYS_PER_DAY

	useEffect(() => {
		if (!canPlayGacha) {
			setGachaMessage(
				`本日は既にガチャを${MAX_GACHA_PLAYS_PER_DAY}回引いているため、これ以上引くことはできません。`,
			)
		} else {
			setGachaMessage('')
		}
	}, [canPlayGacha])

	const handlePlayGacha = useCallback(() => {
		const today = getCurrentJSTDateString({})
		let currentCount = 0 // Initialize with 0
		// localStorageから最新情報を取得して再チェック
		const storedDate = localStorage.getItem('gachaLastPlayedDate')
		const storedCount = parseInt(
			localStorage.getItem('gachaPlayCountToday') || '0',
			10,
		)

		if (storedDate === today) {
			currentCount = storedCount
		} else {
			// 日付が変わっていたら、localStorageも更新
			localStorage.setItem('gachaPlayCountToday', '0')
			localStorage.setItem('gachaLastPlayedDate', today)
		}
		setGachaPlayCountToday(currentCount)
		setLastGachaDateString(today)

		if (currentCount < MAX_GACHA_PLAYS_PER_DAY) {
			setIsGachaSelectPopupOpen(true)
			setGachaMessage('') // Clear any previous messages
		} else {
			setGachaMessage(
				`本日は既にガチャを${MAX_GACHA_PLAYS_PER_DAY}回引いているため、これ以上引くことはできません。`,
			)
			setIsGachaSelectPopupOpen(false) // Ensure popup is closed if limit reached
		}
	}, [])

	const onGachaPlayedSuccessfully = useCallback(() => {
		const today = getCurrentJSTDateString({})
		setGachaPlayCountToday((prev) => {
			const next = prev + 1
			localStorage.setItem('gachaPlayCountToday', next.toString())
			localStorage.setItem('gachaLastPlayedDate', today)
			return next
		})
		setLastGachaDateString(today)
		if (options?.onGachaPlayed) {
			options.onGachaPlayed()
		}
		router.refresh() // Refresh data, e.g., gacha logs
	}, [options, router])

	const closeGachaSelectPopup = () => {
		setIsGachaSelectPopupOpen(false)
	}

	return {
		canPlayGacha,
		gachaPlayCountToday,
		gachaMessage,
		isGachaSelectPopupOpen,
		handlePlayGacha,
		onGachaPlayedSuccessfully,
		closeGachaSelectPopup,
		MAX_GACHA_PLAYS_PER_DAY,
	}
}
