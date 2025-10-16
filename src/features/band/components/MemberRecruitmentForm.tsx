'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import * as zod from 'zod'
import TextareaInputField from '@/components/ui/atoms/TextareaInputField'
import TextInputField from '@/components/ui/atoms/TextInputField'
import MultiSelectField from '@/components/ui/molecules/MultiSelectField'
import { type Part, PartOptions } from '@/features/user/types'
import { logError } from '@/utils/logger'

// import { createMemberRecruitmentAction } from './actions'

const memberRecruitmentSchema = zod.object({
	bandName: zod
		.string()
		.trim()
		.min(2, 'バンド名は2文字以上で入力してください')
		.max(100, 'バンド名は100文字以内で入力してください'),
	part: zod
		.array(
			zod.enum(Object.values(PartOptions) as [Part, ...Part[]], {
				message: '不正なパートが選択されました',
			}),
		)
		.min(1, '少なくとも1つのパートを選択してください'),
	description: zod
		.string()
		.max(500, '説明は500文字以内で入力してください')
		.optional(),
})

type MemberRecruitmentFormValues = zod.infer<typeof memberRecruitmentSchema>

const MemberRecruitmentForm = () => {
	const _router = useRouter()
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)
	const [_popupOpen, setPopupOpen] = useState<boolean>(false)

	const {
		register,
		setValue,
		watch,
		handleSubmit,
		formState: { errors },
	} = useForm<MemberRecruitmentFormValues>({
		resolver: zodResolver(memberRecruitmentSchema),
		defaultValues: {
			bandName: '',
			part: [],
			description: '',
		},
	})

	const part = watch('part')

	useEffect(() => {
		register('part')
	}, [register])

	const onSubmit: SubmitHandler<MemberRecruitmentFormValues> = async (
		_data,
	) => {
		setLoading(true)
		setError(null)

		try {
			// await createMemberRecruitmentAction(data)
			// 成功時の処理
			setPopupOpen(true)
			// router.push('/band/board') // 募集完了後のリダイレクト
		} catch (err) {
			setError('募集の作成に失敗しました。もう一度お試しください。')
			logError('Member recruitment submission failed', err)
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
				<MultiSelectField
					name="part"
					label="募集パート"
					labelId="part-select"
					options={PartOptions}
					watchValue={part as Part[]}
					setValue={setValue}
					errorMessage={errors.part?.message}
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
