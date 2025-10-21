'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useId, useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import * as zod from 'zod'
import UserSelectPopup from '@/domains/band/ui/UserSelectPopup'
import { type Part, PartOptions } from '@/domains/user/model/userTypes'
import TextInputField from '@/shared/ui/atoms/TextInputField'
import MultiSelectField from '@/shared/ui/molecules/MultiSelectField'
import Popup from '@/shared/ui/molecules/Popup'

// import { createBandAction } from './actions'

const bandAddFormSchema = zod.object({
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

type BandAddFormValues = zod.infer<typeof bandAddFormSchema>

const BandAddForm = () => {
	const popupId = useId()
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)
	const [popupOpen, setPopupOpen] = useState<boolean>(false)
	const [userSelectPopupOpen, setUserSelectPopupOpen] = useState<boolean>(false)
	const [selectedUsers, setSelectedUsers] = useState<string[]>([])

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm<BandAddFormValues>({
		resolver: zodResolver(bandAddFormSchema),
		defaultValues: {
			bandName: '',
			part: [],
			description: '',
		},
	})

	const watchedParts = watch('part') ?? []

	useEffect(() => {
		register('part')
	}, [register])

	const handleUserSelect = useCallback((userIds: string[]) => {
		setSelectedUsers(userIds)
	}, [])

	const onSubmit: SubmitHandler<BandAddFormValues> = async (_data) => {
		setLoading(true)
		setError(null)

		try {
			// await createBandAction(data, selectedUsers)
			// 成功時の処理
			setPopupOpen(true)
			// router.push('/band/board') // バンド作成後のリダイレクト
		} catch (_err) {
			setError('バンドの作成に失敗しました。もう一度お試しください。')
		} finally {
			setLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<TextInputField
				type="text"
				label="バンド名"
				{...register('bandName')}
				errorMessage={errors.bandName?.message}
			/>
			<MultiSelectField
				name="part"
				label="パート"
				options={PartOptions}
				setValue={setValue}
				watchValue={watchedParts}
				errorMessage={errors.part?.message}
			/>
			<TextInputField
				label="説明"
				type="textarea"
				{...register('description')}
				errorMessage={errors.description?.message}
			/>
			<button
				type="button"
				className="btn btn-secondary"
				onClick={() => setUserSelectPopupOpen(true)}
			>
				ユーザーを選択
			</button>
			<button type="submit" className="btn btn-primary" disabled={loading}>
				{loading ? '作成中...' : 'バンドを作成'}
			</button>
			{error && <p className="text-red-500">{error}</p>}
			<Popup
				id={popupId}
				open={popupOpen}
				onClose={() => setPopupOpen(false)}
				title="バンド作成完了"
				maxWidth="max-w-md"
			>
				<p>バンドが作成されました！</p>
				<button
					type="button"
					className="btn btn-primary mt-4"
					onClick={() => setPopupOpen(false)}
				>
					閉じる
				</button>
			</Popup>
			<UserSelectPopup
				open={userSelectPopupOpen}
				onClose={() => setUserSelectPopupOpen(false)}
				userSelect={selectedUsers}
				onUserSelect={handleUserSelect}
			/>
		</form>
	)
}

export default BandAddForm
