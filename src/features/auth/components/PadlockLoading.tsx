'use client'

import AuthLoadingIndicator from '@/features/auth/components/AuthLoadingIndicator'

type PadlockLoadingProps = {
	message: string
}

const PadlockLoading = ({ message }: PadlockLoadingProps) => (
	<AuthLoadingIndicator message={message} />
)

export default PadlockLoading
