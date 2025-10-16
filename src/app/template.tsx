'use server'

import type { ReactNode } from 'react'

function Template({ children }: { children: ReactNode }) {
	return (
		<main className={`container mx-auto px-2 h-full max-w-screen-lg`}>
			{children}
		</main>
	)
}

export default Template
