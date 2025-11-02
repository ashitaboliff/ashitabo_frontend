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
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { AdSenseProvider } from '@/shared/ui/ads'
 * import PublicEnv from '@/shared/lib/env/public'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <AdSenseProvider clientId={PublicEnv.NEXT_PUBLIC_ADS_ID || ''}>
 *           {children}
 *         </AdSenseProvider>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export const AdSenseProvider = ({
	clientId,
	children,
}: {
	clientId: string
	children: React.ReactNode
}) => {
	return (
		<AdSenseContext.Provider value={{ clientId }}>
			{children}
		</AdSenseContext.Provider>
	)
}

/**
 * AdSense設定を取得するフック
 * @returns AdSense設定（Providerがない場合はnull）
 */
export const useAdSenseContext = (): AdSenseContextValue | null => {
	return useContext(AdSenseContext)
}
