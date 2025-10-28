'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next-nprogress-bar'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
	createProfileAction,
	putProfileAction,
} from '@/domains/auth/api/authActions'
import { useSession } from '@/domains/auth/hooks/useSession'
import { makeAuthDetails } from '@/domains/auth/utils/sessionInfo'
import {
	getAutoExpectedYear,
	type ProfileFormValues,
	profileDefaultValues,
	profileSchema,
	toProfileFormValues,
} from '@/domains/user/model/profileSchema'
import type { Profile } from '@/domains/user/model/userTypes'
import { useFeedback } from '@/shared/hooks/useFeedback'
import { logError } from '@/shared/utils/logger'
import { StatusCode } from '@/types/response'

export type ProfileFormMode = 'create' | 'edit'

interface UseProfileFormOptions {
	mode: ProfileFormMode
	profile?: Profile | null
}

export const useProfileForm = ({ mode, profile }: UseProfileFormOptions) => {
	const router = useRouter()
	const session = useSession()
	const feedback = useFeedback()

	const form = useForm<ProfileFormValues>({
		mode: 'onBlur',
		resolver: zodResolver(profileSchema),
		defaultValues:
			mode === 'edit' ? toProfileFormValues(profile) : profileDefaultValues,
	})

	const role = form.watch('role')
	const studentId = form.watch('studentId')

	useEffect(() => {
		if (role !== 'STUDENT') {
			form.setValue('expected', undefined, { shouldValidate: true })
			return
		}
		const expected = getAutoExpectedYear(studentId)
		if (expected) {
			form.setValue('expected', expected, { shouldValidate: true })
		}
	}, [role, studentId, form])

	const onSubmit = async (values: ProfileFormValues) => {
		feedback.clearFeedback()
		const authInfo = makeAuthDetails(session.data ?? null)

		if (authInfo.status === 'guest' || authInfo.status === 'invalid') {
			feedback.showError(
				'ログイン情報がありません。再度ログインしてください。',
				{
					code: StatusCode.UNAUTHORIZED,
				},
			)
			return
		}

		if (mode === 'create' && authInfo.status === 'signed-in') {
			feedback.showError(
				'プロフィールは既に作成されています。編集ページをご利用ください。',
				{
					code: StatusCode.FORBIDDEN,
				},
			)
			router.push('/user/edit')
			return
		}

		const userId = authInfo.userId ?? ''
		if (!userId) {
			feedback.showError('ユーザーIDが取得できませんでした。', {
				code: StatusCode.UNAUTHORIZED,
			})
			return
		}

		try {
			const response =
				mode === 'create'
					? await createProfileAction({ userId, body: values })
					: await putProfileAction({ userId, body: values })

			if (response.ok) {
				await session.update({ triggerUpdate: Date.now() })
				feedback.showSuccess(
					mode === 'create'
						? 'プロフィールを登録しました。'
						: 'プロフィールを更新しました。',
				)
				if (mode === 'create') {
					router.push('/user')
				}
				if (mode === 'edit') {
					router.refresh()
				}
			} else {
				feedback.showApiError(response)
			}
		} catch (error) {
			feedback.showError(
				'エラーが発生しました。このエラーが続く場合は管理者にお問い合わせください。',
				{
					details: error instanceof Error ? error.message : String(error),
				},
			)
			logError('Profile submit error', error)
		}
	}

	return {
		form,
		onSubmit,
		feedback,
	}
}

export type UseProfileFormReturn = ReturnType<typeof useProfileForm>
