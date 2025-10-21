'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next-nprogress-bar'
import { useCallback, useId, useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import * as zod from 'zod'
import Pagination from '@/shared/ui/atoms/Pagination'
import SelectField from '@/shared/ui/atoms/SelectField'
import TextInputField from '@/shared/ui/atoms/TextInputField'
import { TiDeleteOutline } from '@/shared/ui/icons'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import Popup from '@/shared/ui/molecules/Popup'
import type { PadLock } from '@/domains/admin/model/adminTypes'
import type { ApiError } from '@/types/responseTypes'
import { formatDateTimeJaWithUnits } from '@/shared/utils/dateFormat'
import { createPadLockAction, deletePadLockAction } from '@/domains/admin/api/adminActions'

const padLockFormSchema = zod.object({
	name: zod
		.string()
		.trim()
		.min(2, '鍵管理のための名前を入力してください')
		.max(100, '鍵管理のための名前は100文字以内で入力してください'),
	password: zod
		.string()
		.regex(/^\d{4}$/, 'パスワードは4桁の数字で入力してください'),
})

type PadLockFormValues = zod.infer<typeof padLockFormSchema>

interface Props {
	readonly padLocks: PadLock[]
}

const PadLockEdit = ({ padLocks }: Props) => {
	const router = useRouter()
	const [currentPage, setCurrentPage] = useState<number>(1)
	const [padLocksPerPage, setPadLocksPerPage] = useState(10)
	const [popupData, setPopupData] = useState<PadLock | undefined | null>(
		padLocks?.[0] ?? undefined,
	)
	const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)
	const [isCreatePopupOpen, setIsCreatePopupOpen] = useState<boolean>(false)
	const [isDeletePopupOpen, setIsDeletePopupOpen] = useState<boolean>(false)
	const popupId = useId()
	const deletePopupId = useId()
	const createPopupId = useId()

	const [error, setError] = useState<ApiError>()

	const totalPadLocks = padLocks?.length ?? 0
	const pageMax = Math.ceil(totalPadLocks / padLocksPerPage)

	const indexOfLastPadLock = currentPage * padLocksPerPage
	const indexOfFirstPadLock = indexOfLastPadLock - padLocksPerPage
	const currentPadLocks =
		padLocks?.slice(indexOfFirstPadLock, indexOfLastPadLock) ?? []

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<PadLockFormValues>({
		mode: 'onBlur',
		resolver: zodResolver(padLockFormSchema),
		defaultValues: { name: '', password: '' },
	})

	const onSubmit: SubmitHandler<PadLockFormValues> = useCallback(
		async (data) => {
			const res = await createPadLockAction({
				name: data.name,
				password: data.password,
			})
			if (res.ok) {
				setIsCreatePopupOpen(false)
				reset({ name: '', password: '' })
			} else {
				setError(res)
			}
		},
		[reset],
	)

	const onDelete = useCallback(async (id: string) => {
		const res = await deletePadLockAction({
			id,
		})
		if (res.ok) {
			setIsDeletePopupOpen(false)
			setIsPopupOpen(false)
		} else {
			setError(res)
		}
	}, [])

	return (
		<div className="flex flex-col items-center justify-center gap-y-2">
			<h1 className="text-2xl font-bold">ログイン用パスワード管理</h1>
			<p className="text-sm text-center">
				このページではアカウント新規作成時のログイン用パスワードを管理することができます。
				<br />
				基本的には部室の4桁のパスワードを年間で管理しますが、OB、OG用のパスワードを発行することも可能です。
			</p>
			<button
				type="button"
				className="btn btn-primary btn-outline btn-md"
				onClick={() => setIsCreatePopupOpen(true)}
			>
				パスワードを新規作成
			</button>
			<div className="overflow-x-auto w-full flex flex-col justify-center gap-y-2">
				<div className="flex flex-row items-center ml-auto space-x-2 w-1/2">
					<p className="text-sm whitespace-nowrap">表示件数:</p>
					<SelectField
						value={padLocksPerPage}
						onChange={(e) => {
							setPadLocksPerPage(Number(e.target.value))
							setCurrentPage(1)
						}}
						options={{ '10件': 10, '20件': 20, '30件': 30 }}
						name="padLocksPerPage"
					/>
				</div>
				<table className="table table-zebra table-sm w-full justify-center">
					<thead>
						<tr>
							<th></th>
							<th>管理名</th>
							<th>作成日</th>
							<th>更新日</th>
						</tr>
					</thead>
					<tbody>
						{currentPadLocks.map((padLock) => (
							<tr
								key={padLock.id}
								onClick={() => {
									setPopupData(padLock)
									setIsPopupOpen(true)
								}}
							>
								<td>
									{padLock.isDeleted && (
										<div className="badge badge-error text-bg-light">
											<TiDeleteOutline className="inline" />
										</div>
									)}
								</td>
								<td>{padLock.name}</td>
								<td>
									{formatDateTimeJaWithUnits(padLock.createdAt, {
										hour12: true,
									})}
								</td>
								<td>
									{formatDateTimeJaWithUnits(padLock.updatedAt, {
										hour12: true,
									})}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<Popup
				id={popupId}
				title="パスワード詳細"
				open={isPopupOpen}
				onClose={() => setIsPopupOpen(false)}
			>
				<div className="flex flex-col items-center space-y-2 text-sm">
					{popupData?.isDeleted && (
						<div className="text-error font-bold">削除済み</div>
					)}
					<div className="grid grid-cols-2 gap-2">
						<div className="font-bold">管理名:</div>
						<div>{popupData?.name}</div>
						<div className="font-bold">作成日:</div>
						<div>
							{popupData?.createdAt &&
								formatDateTimeJaWithUnits(popupData.createdAt, {
									hour12: true,
								})}
						</div>
						<div className="font-bold">更新日:</div>
						<div>
							{popupData?.updatedAt &&
								formatDateTimeJaWithUnits(popupData.updatedAt, {
									hour12: true,
								})}
						</div>
					</div>
					<div className="flex flex-row gap-x-2">
						<button
							type="button"
							className="btn btn-error"
							onClick={() => setIsDeletePopupOpen(true)}
						>
							削除
						</button>
						<button
							type="button"
							className="btn btn-outline"
							onClick={() => setIsPopupOpen(false)}
						>
							閉じる
						</button>
					</div>
				</div>
			</Popup>
			<Popup
				id={deletePopupId}
				title="パスワード削除"
				open={isDeletePopupOpen}
				onClose={() => setIsDeletePopupOpen(false)}
			>
				<div className="flex flex-col gap-y-2">
					<p>本当に削除しますか?</p>
					<button
						type="button"
						className="btn btn-error"
						onClick={async () => {
							if (popupData?.id) {
								await onDelete(popupData.id)
							}
						}}
					>
						削除
					</button>
				</div>
				<FeedbackMessage source={error} defaultVariant="error" />
			</Popup>
			<Popup
				id={createPopupId}
				title="パスワード作成"
				open={isCreatePopupOpen}
				onClose={() => setIsCreatePopupOpen(false)}
			>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="flex flex-col items-center justify-center gap-y-2"
				>
					<TextInputField
						label="管理名"
						type="text"
						register={register('name')}
						errorMessage={errors.name?.message}
					/>
					<TextInputField
						label="パスワード"
						type="number"
						register={register('password')}
						errorMessage={errors.password?.message}
					/>
					<div className="flex flex-row gap-x-2 justify-center">
						<button type="submit" className="btn btn-primary">
							作成
						</button>
						<button
							type="button"
							className="btn btn-outline"
							onClick={() => setIsCreatePopupOpen(false)}
						>
							閉じる
						</button>
					</div>
					<FeedbackMessage source={error} defaultVariant="error" />
				</form>
			</Popup>
			<Pagination
				currentPage={currentPage}
				totalPages={pageMax}
				onPageChange={(page) => setCurrentPage(page)}
			/>
			<button
				type="button"
				className="btn btn-outline"
				onClick={() => router.push('/admin')}
			>
				戻る
			</button>
		</div>
	)
}

export default PadLockEdit
