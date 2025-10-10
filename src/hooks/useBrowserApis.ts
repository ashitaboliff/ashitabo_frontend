'use client'

import { useCallback } from 'react'

export type WindowOpenFn = (url: string, target?: string, features?: string) => Window | null

export const useWindowOpen = (): WindowOpenFn =>
	useCallback((url: string, target?: string, features?: string) => {
		if (typeof window === 'undefined') {
			return null
		}
		return window.open(url, target, features)
	}, [])

export type ShareFn = (data: ShareData) => Promise<void>

export const useNavigatorShare = (): ShareFn =>
	useCallback(async (data: ShareData) => {
		if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
			throw new Error('This browser does not support navigator.share')
		}
		await navigator.share(data)
	}, [])

export const useWindowAlert = () =>
	useCallback((message: string) => {
		if (typeof window === 'undefined' || typeof window.alert !== 'function') {
			return
		}
		window.alert(message)
	}, [])

export const useLocationNavigate = () =>
	useCallback((href: string) => {
		if (typeof window === 'undefined') {
			return
		}
		window.location.href = href
	}, [])
