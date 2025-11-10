'use client'

import Script from 'next/script'

/**
 * AdSenseスクリプトを読み込むコンポーネント
 */
const AdSenseScript = ({ adsId }: { adsId: string }) => {
	return (
		<Script
			id="adsbygoogle-init"
			strategy="afterInteractive"
			async
			src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsId}`}
			crossOrigin="anonymous"
		/>
	)
}

export default AdSenseScript
