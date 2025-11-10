'use client'

import Script from 'next/script'
import PublicEnv from '@/shared/lib/env/public'

/**
 * AdSenseスクリプトを読み込むコンポーネント
 */
const AdSenseScript = () => {
	return (
		<Script
			id="adsbygoogle-init"
			strategy="afterInteractive"
			async
			src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PublicEnv.NEXT_PUBLIC_ADS_ID}`}
			crossOrigin="anonymous"
		/>
	)
}

export default AdSenseScript
