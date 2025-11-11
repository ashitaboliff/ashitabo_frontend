'use client'

import { createContext, useContext } from 'react'

/**
 * AdSense設定のコンテキスト
 */
interface AdSenseContextValue {
	clientId: string
}

const AdSenseContext = createContext<AdSenseContextValue | null>(null)

/**
 * AdSense設定を提供するプロバイダー
 * @param clientId - AdSenseクライアントID
 * @param children - 子要素
 */
export const AdSenseProvider = ({
	clientId,
	children,
}: {
	clientId: string
	children: React.ReactNode
}) => {
	return <AdSenseContext value={{ clientId }}>{children}</AdSenseContext>
}

/**
 * AdSense設定を取得するフック
 * @returns AdSense設定（Providerがない場合はnull）
 */
export const useAdSenseContext = (): AdSenseContextValue | null => {
	return useContext(AdSenseContext)
}
