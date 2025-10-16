'use client'

import Image from 'next/image'
import PadlockErrorDisplay from '@/features/auth/components/PadlockErrorDisplay'
import PadlockForm from '@/features/auth/components/PadlockForm'
import PadlockLoading from '@/features/auth/components/PadlockLoading'
import { useAuthPadlock } from '@/features/auth/hooks/useAuthPadlock'
import { getImageUrl } from '@/lib/r2'

export type AuthPadLockProps = {
	csrfToken?: string | null
	callbackUrl?: string | null
}

const AuthPadLock = ({ csrfToken, callbackUrl }: AuthPadLockProps) => {
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
		<div className="flex flex-col items-center justify-center space-y-2 h-full">
			{isLoading && <PadlockLoading message={loadingMessage} />}
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
			</form>
			<div className="card bg-white shadow-lg w-96 h-[30rem] my-6">
				<figure>
					<Image
						src={getImageUrl('/home/activity/activity-2.jpg')}
						alt="padlock"
						width={384}
						height={250}
					/>
				</figure>
				<div className="flex flex-col items-center justify-center gap-y-2 p-4">
					<div className="text-base font-bold mx-2 text-center">
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
			<PadlockErrorDisplay feedback={feedbackMessage} fieldError={digitError} />
		</div>
	)
}

export default AuthPadLock
