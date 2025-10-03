'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next-nprogress-bar'
import { MAX_GACHA_PLAYS_PER_DAY } from '@/features/gacha/components/config/gachaConfig'
import { getCurrentJSTDateString } from '@/utils'

interface UseGachaPlayManagerOptions {
	onGachaPlayed?: () => void
}

export const useGachaPlayManager = (options?: UseGachaPlayManagerOptions) => {
	const router = useRouter()
	const [gachaPlayCountToday, setGachaPlayCountToday] = useState<number>(0)
	const [lastGachaDateString, setLastGachaDateString] = useState<string>('')
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
	}, [canPlayGacha, gachaPlayCountToday])

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
		// Update state based on potentially updated localStorage
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
	}, [gachaPlayCountToday, lastGachaDateString])

	const onGachaPlayedSuccessfully = useCallback(() => {
		const today = getCurrentJSTDateString({})
		const newCount = gachaPlayCountToday + 1
		localStorage.setItem('gachaPlayCountToday', newCount.toString())
		localStorage.setItem('gachaLastPlayedDate', today)
		setGachaPlayCountToday(newCount)
		setLastGachaDateString(today)
		if (options?.onGachaPlayed) {
			options.onGachaPlayed()
		}
		router.refresh() // Refresh data, e.g., gacha logs
	}, [gachaPlayCountToday, router, options])

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
