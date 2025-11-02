'use client'

import Script from 'next/script'

/**
 * AdSenseスクリプトを読み込むコンポーネント
 * アプリケーション全体で1回だけ読み込むために、
 * レイアウトファイル（layout.tsx）に配置することを推奨します。
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { AdSenseScript } from '@/shared/ui/ads'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <AdSenseScript />
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
const AdSenseScript = () => {
	return (
		<Script
			id="adsbygoogle-init"
			strategy="afterInteractive"
			async
			src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
			crossOrigin="anonymous"
		/>
	)
}

export default AdSenseScript
