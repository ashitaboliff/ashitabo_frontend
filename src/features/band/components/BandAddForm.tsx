'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as zod from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import TextInputField from '@/components/ui/atoms/TextInputField'
import SelectField from '@/components/ui/atoms/SelectField'
import Popup from '@/components/ui/molecules/Popup'
import UserSelectPopup from '@/components/interactive/UserSelectPopup'
import { PartOptions, Part } from '@/features/user/types'

// import { createBandAction } from './actions'

const BandAddForm = () => {
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)
	const [popupOpen, setPopupOpen] = useState<boolean>(false)
	const [userSelectPopupOpen, setUserSelectPopupOpen] = useState<boolean>(false)
	const [selectedUsers, setSelectedUsers] = useState<string[]>([])

	const schema = zod.object({
		bandName: zod
			.string()
			.min(2)
			.max(100)
			.nonempty('バンド名を入力してください'),
		part: zod
			.array(
				zod.enum(Object.values(PartOptions), {
					message: '不正なパートが選択されました',
				}),
			)
			.min(1, '少なくとも1つのパートを選択してください'),
		description: zod
			.string()
			.max(500, '説明は500文字以内で入力してください')
			.optional(),
	})

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(schema),
	})

	const onSubmit = async (data: any) => {
		setLoading(true)
		setError(null)

		try {
			// await createBandAction(data, selectedUsers)
			// 成功時の処理
			setPopupOpen(true)
			// router.push('/band/board') // バンド作成後のリダイレクト
		} catch (err) {
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
			<SelectField
				label="パート"
				options={PartOptions}
				isMultiple
				{...register('part')}
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
				id="band-add-popup"
				open={popupOpen}
				onClose={() => setPopupOpen(false)}
				title="バンド作成完了"
				maxWidth="max-w-md"
			>
				<p>バンドが作成されました！</p>
				<button
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
				onUserSelect={(userIds) => {
					setSelectedUsers(userIds)
				}}
			/>
		</form>
	)
}

export default BandAddForm
