'use server'

import { cookies } from 'next/headers'
import type { NoticeType } from '@/shared/ui/molecules/FlashMessage'

interface Option {
	readonly key: string
}

const useFlashMessage = async (options: Option) => {
	const cookieStore = await cookies()
	const flash = cookieStore.get(options.key)?.value
	let type: NoticeType | undefined
	let message: string | undefined

	if (flash) {
		;({ type, message } = JSON.parse(flash) as {
			type: NoticeType
			message: string
		})
	}

	return { type, message }
}

export default useFlashMessage
