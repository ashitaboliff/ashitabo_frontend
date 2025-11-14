'use client'

import Script from 'next/script'

/**
 * AdSenseスクリプトを読み込むコンポーネント
 */
const AdSenseScript = ({ adsId }: { adsId: string }) => {
	return (
		<>
			<Script
				id="adsbygoogle-init"
				strategy="afterInteractive"
				async
				src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsId}`}
				crossOrigin="anonymous"
			/>
			<Script
				id="adsbygoogle-fundingchoices"
				strategy="afterInteractive"
				async
				src="https://fundingchoicesmessages.google.com/i/pub-6241533281842243?ers=1"
			/>
			<Script
				strategy="afterInteractive"
				id="adsbygoogle-fundingchoices-init"
				async
				src="/ads-brocker.js"
			/>
		</>
	)
}

export default AdSenseScript
