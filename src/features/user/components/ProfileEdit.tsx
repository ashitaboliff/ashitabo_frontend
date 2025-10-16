'use client'

import ErrorMessage from '@/components/ui/atoms/ErrorMessage'
import Loading from '@/components/ui/atoms/Loading'
import SelectField from '@/components/ui/atoms/SelectField'
import TextInputField from '@/components/ui/atoms/TextInputField'
import MultiSelectField from '@/components/ui/molecules/MultiSelectField'
import { useProfileForm } from '@/features/user/hooks/useProfileForm'
import { expectedYearMap } from '@/features/user/schemas/profileSchema'
import { PartOptions, type Profile } from '@/features/user/types'

const ProfileEdit = ({ profile }: { profile: Profile }) => {
	const { form, onSubmit, feedback } = useProfileForm({ mode: 'edit', profile })
	const submitFeedback = feedback.feedback

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

	return (
		<div className="flex flex-col items-center justify-center p-4 bg-white shadow-lg rounded-lg">
			{isSubmitting && <Loading />}
			<h1 className="text-2xl font-bold mb-4">プロフィール編集</h1>
			<ErrorMessage message={submitFeedback} className="mb-4 w-full max-w-xs" />
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
					</>
				)}

				<div className="flex justify-center">
					<button type="submit" className="btn btn-primary">
						保存
					</button>
				</div>
			</form>
		</div>
	)
}

export default ProfileEdit
