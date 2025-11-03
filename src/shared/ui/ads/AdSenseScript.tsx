'use client'

import Script from 'next/script'

/**
 * AdSenseスクリプトを読み込むコンポーネント
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
