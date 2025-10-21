'use client'

import { AppProgressBar } from 'next-nprogress-bar'
import type { ReactNode } from 'react'

const ProgressBarProvider = ({ children }: { children: ReactNode }) => {
	return (
		<>
			<AppProgressBar
				height="4px"
				color="#3C87E0"
				options={{ showSpinner: false }}
				shallowRouting
			/>
			{children}
		</>
	)
}

export default ProgressBarProvider
