'use client'

import AuthLoadingIndicator from '@/domains/auth/ui/AuthLoadingIndicator'

type PadlockLoadingProps = {
	message: string
}

const PadlockLoading = ({ message }: PadlockLoadingProps) => (
	<AuthLoadingIndicator message={message} />
)

export default PadlockLoading
