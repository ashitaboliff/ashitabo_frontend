'use client'

import Image from 'next/image'
import PadlockForm from '@/app/auth/padlock/_components/PadlockForm'
import { useAuthPadlock } from '@/domains/auth/hooks/useAuthPadlock'
import AuthLoadingIndicator from '@/domains/auth/ui/AuthLoadingIndicator'
import { getImageUrl } from '@/shared/lib/r2'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'

interface Props {
	readonly csrfToken?: string | null
	readonly callbackUrl?: string | null
}

const PadLockPage = ({ csrfToken, callbackUrl }: Props) => {
	const {
		formRef,
		isLoading,
		loadingMessage,
		feedbackMessage,
		digitError,
		effectiveCallbackUrl,
		onSubmit,
		handleClear,
		handleDigitChange,
		handleDigitKeyDown,
		register,
		errors,
		disableSubmit,
	} = useAuthPadlock({
		initialCsrfToken: csrfToken,
		callbackUrl,
	})

	return (
		<div className="flex h-full flex-col items-center justify-center space-y-2">
			{isLoading && <AuthLoadingIndicator message={loadingMessage} />}
			<form
				ref={formRef}
				action="/api/auth/signin/line"
				method="POST"
				className="hidden"
			>
				<input type="hidden" name="csrfToken" defaultValue={csrfToken ?? ''} />
				<input
					type="hidden"
					name="callbackUrl"
					defaultValue={effectiveCallbackUrl}
				/>
				<input type="hidden" name="padlockToken" defaultValue="" />
			</form>
			<div className="card my-6 h-[30rem] w-96 bg-white shadow-lg">
				<figure>
					<Image
						src={getImageUrl('/utils/padlock.webp')}
						alt="padlock"
						width={384}
						height={250}
						unoptimized
					/>
				</figure>
				<div className="flex flex-col items-center justify-center gap-y-2 p-4">
					<div className="mx-2 text-center font-bold text-base">
						部室のパスワードを入力してください
					</div>
					<PadlockForm
						register={register}
						errors={errors}
						onSubmit={onSubmit}
						onClear={handleClear}
						onDigitChange={handleDigitChange}
						onDigitKeyDown={handleDigitKeyDown}
						disableSubmit={disableSubmit}
					/>
				</div>
			</div>
			<div className="space-y-2">
				<FeedbackMessage source={feedbackMessage} />
				{digitError ? (
					<p className="text-center text-error text-sm">{digitError}</p>
				) : null}
			</div>
		</div>
	)
}

export default PadLockPage
