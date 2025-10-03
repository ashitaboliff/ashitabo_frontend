'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useRouter } from 'next/navigation'
import TextInputField from '@/components/ui/atoms/TextInputField'
import TextareaInputField from '@/components/ui/atoms/TextareaInputField'
import SelectField from '@/components/ui/atoms/SelectField'
import Popup from '@/components/ui/molecules/Popup'
import { PartOptions, Part } from '@/features/user/types'

// import { createMemberRecruitmentAction } from './actions'

const schema = yup.object().shape({
	bandName: yup.string().required('バンド名を入力してください'),
	part: yup
		.array()
		.of(yup.string())
		.min(1, '少なくとも1つのパートを選択してください'),
	description: yup.string().max(500, '説明は500文字以内で入力してください'),
})

const MemberRecruitmentForm = () => {
	const router = useRouter()
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)
	const [popupOpen, setPopupOpen] = useState<boolean>(false)

	const {
		register,
		setValue,
		watch,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
	})

	const part = watch('part')

	const onSubmit = async (data: any) => {
		setLoading(true)
		setError(null)

		try {
			// await createMemberRecruitmentAction(data)
			// 成功時の処理
			setPopupOpen(true)
			// router.push('/band/board') // 募集完了後のリダイレクト
		} catch (err) {
			setError('募集の作成に失敗しました。もう一度お試しください。')
		} finally {
			setLoading(false)
		}
	}

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="flex flex-col w-full space-y-4"
		>
			<fieldset disabled className="space-y-4 disabled:opacity-50">
				<TextInputField
					type="text"
					placeholder="例: 錯乱前戦のコピバン"
					label="バンド名"
					labelId="band-name"
					{...register('bandName')}
					errorMessage={errors.bandName?.message}
				/>
				<SelectField
					label="募集パート"
					labelId="part-select"
					options={PartOptions}
					{...register('part')}
					watchValue={part as Part[]}
					setValue={setValue}
					errorMessage={errors.part?.message}
					isMultiple
				/>
				<TextareaInputField
					label="説明"
					labelId="recruitment-description"
					placeholder="例: 錯乱前戦のコピーバンドです。メンバーはわたべ(ベース)のみ決まっています。ライブに出るのは9月のあしたぼライブを想定しています。"
					{...register('description')}
					errorMessage={errors.description?.message}
				/>
				<button type="submit" className="btn btn-primary" disabled={loading}>
					{loading ? '作成中...' : '募集を作成'}
				</button>
			</fieldset>
			{error && <p className="text-secondary">{error}</p>}
		</form>
	)
}

export default MemberRecruitmentForm
