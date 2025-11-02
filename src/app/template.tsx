'use server'

import type { ReactNode } from 'react'

function Template({ children }: { children: ReactNode }) {
	return (
		<main className={`container mx-auto h-full max-w-screen-lg px-2`}>
			{children}
		</main>
	)
}

export default Template
