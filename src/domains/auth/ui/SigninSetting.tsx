'use client'

import { useRouter } from 'next-nprogress-bar'
import SelectField from '@/shared/ui/atoms/SelectField'
import TextInputField from '@/shared/ui/atoms/TextInputField'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import MultiSelectField from '@/shared/ui/molecules/MultiSelectField'
import { signOutUser } from '@/domains/user/hooks/useSignOut'
import { useProfileForm } from '@/domains/user/hooks/useProfileForm'
import { expectedYearMap } from '@/domains/user/schemas/profileSchema'
import { PartOptions } from '@/domains/user/model/userTypes'
import { useFeedback } from '@/shared/hooks/useFeedback'
import AuthLoadingIndicator from './AuthLoadingIndicator'

const SigninSetting = () => {
	const router = useRouter()
	const profileForm = useProfileForm({ mode: 'create' })
	const signOutFeedback = useFeedback()

	const { form, onSubmit, feedback } = profileForm
	const submitFeedback = feedback.feedback
	const signOutMessage = signOutFeedback.feedback

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = form

	const selectedRole = watch('role')
	const selectedParts = watch('part') ?? []

	const isStudent = selectedRole === 'STUDENT'

	const handleSignOut = async () => {
		signOutFeedback.clearFeedback()
		const result = await signOutUser()
		if (result.ok) {
			signOutFeedback.showSuccess('サインアウトしました。')
			router.push('/home')
		} else {
			signOutFeedback.showApiError(result)
		}
	}

	return (
		<div className="flex flex-col items-center justify-center p-4 bg-white shadow-lg rounded-lg relative">
			{isSubmitting && (
				<AuthLoadingIndicator message="プロフィールを保存しています..." />
			)}
			<h1 className="text-2xl font-bold mb-4">ユーザ設定</h1>
			<div className="w-full max-w-xs space-y-3">
				<FeedbackMessage source={submitFeedback} />
				<FeedbackMessage source={signOutMessage} />
			</div>
			<form
				className="flex flex-col space-y-4 w-full max-w-xs"
				onSubmit={handleSubmit(onSubmit)}
			>
				<TextInputField
					type="text"
					register={register('name')}
					label="本名"
					infoDropdown="アカウント管理のために本名を入力してください。"
					errorMessage={errors.name?.message}
				/>

				<div className="flex flex-row items-center space-x-2">
					<label className="label cursor-pointer">
						<input
							type="radio"
							value="STUDENT"
							{...register('role')}
							className="radio radio-primary"
						/>
						<span className="label-text">現役生</span>
					</label>

					<label className="label cursor-pointer">
						<input
							type="radio"
							value="GRADUATE"
							{...register('role')}
							className="radio radio-primary"
						/>
						<span className="label-text">卒業生</span>
					</label>
				</div>
				{errors.role && (
					<span className="text-xs text-error">{errors.role.message}</span>
				)}

				<MultiSelectField
					name="part"
					register={register('part')}
					options={PartOptions}
					label="使用楽器(複数選択可)"
					setValue={setValue}
					watchValue={selectedParts}
					infoDropdown={
						<>
							使用楽器を選択してください、複数選択可能です。
							<br />
							また、他の楽器経験があればその他を選択してください。
						</>
					}
					errorMessage={errors.part?.message}
				/>

				{isStudent && (
					<>
						<TextInputField
							type="text"
							register={register('studentId')}
							label="学籍番号"
							infoDropdown="信州大学および長野県立大学の学籍番号のフォーマットに対応しています。"
							errorMessage={errors.studentId?.message}
						/>

						<SelectField
							name="expected"
							register={register('expected')}
							options={expectedYearMap}
							label="卒業予定年度"
							infoDropdown="この値はいつでも変更できます。留年しても大丈夫！（笑）"
							errorMessage={errors.expected?.message}
						/>
						<p className="text-sm">
							※学籍番号から院進や留年を想定した値が自動計算されます。変更したい場合は編集で調整してください。
						</p>
					</>
				)}

				<div className="flex flex-col sm:flex-row items-center justify-center gap-2">
					<button type="submit" className="btn btn-primary w-full sm:w-auto">
						保存
					</button>
					<button
						type="button"
						className="btn btn-outline w-full sm:w-auto"
						onClick={handleSignOut}
					>
						サインアウト
					</button>
				</div>
			</form>
		</div>
	)
}

export default SigninSetting
