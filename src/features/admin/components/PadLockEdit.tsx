'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { useRouter } from 'next-nprogress-bar'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { createPadLockAction, deletePadLockAction } from '../action'
import { PadLock } from '@/features/admin/types'
import { ApiError } from '@/types/responseTypes'
import Pagination from '@/components/ui/atoms/Pagination'
import TextInputField from '@/components/ui/atoms/TextInputField'
import SelectField from '@/components/ui/atoms/SelectField'
import ErrorMessage from '@/components/ui/atoms/ErrorMessage'
import Popup from '@/components/ui/molecules/Popup'

import { TiDeleteOutline } from 'react-icons/ti'
import type { Session } from '@/types/session'

const PadLockSchema = zod.object({
	name: zod
		.string()
		.min(2, '鍵管理のための名前を入力してください')
		.max(100, '鍵管理のための名前は100文字以内で入力してください'),
	password: zod.number().min(0, 'パスワードを入力してください').max(9999),
})

const PadLockEdit = ({
	padLocks,
	session,
}: {
	padLocks: PadLock[]
	session: Session
}) => {
	const router = useRouter()
	const [currentPage, setCurrentPage] = useState<number>(1)
	const [padLocksPerPage, setPadLocksPerPage] = useState(10)
	const [popupData, setPopupData] = useState<PadLock | undefined | null>(
		padLocks?.[0] ?? undefined,
	)
	const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)
	const [isCreatePopupOpen, setIsCreatePopupOpen] = useState<boolean>(false)
	const [isDeletePopupOpen, setIsDeletePopupOpen] = useState<boolean>(false)

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
	} = useForm({
		mode: 'onBlur',
		resolver: zodResolver(PadLockSchema),
	})

	const onSubmit = async (data: any) => {
		const name = data.name
		const password = data.password
		const res = await createPadLockAction({
			name,
			password: password.toString(),
		})
		if (res.ok) {
			setIsCreatePopupOpen(false)
			reset()
		} else {
			setError(res)
		}
	}

	const onDelete = async (id: string) => {
		const res = await deletePadLockAction({
			id,
		})
		if (res.ok) {
			setIsDeletePopupOpen(false)
			setIsPopupOpen(false)
		} else {
			setError(res)
		}
	}

	return (
		<div className="flex flex-col items-center justify-center gap-y-2">
			<h1 className="text-2xl font-bold">ログイン用パスワード管理</h1>
			<p className="text-sm text-center">
				このページではアカウント新規作成時のログイン用パスワードを管理することができます。
				<br />
				基本的には部室の4桁のパスワードを年間で管理しますが、OB、OG用のパスワードを発行することも可能です。
			</p>
			<button
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
									{format(padLock.createdAt, 'yyyy年MM月dd日hh時mm分ss秒', {
										locale: ja,
									})}
								</td>
								<td>
									{format(padLock.updatedAt, 'yyyy年MM月dd日hh時mm分ss秒', {
										locale: ja,
									})}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<Popup
				id="padlock-popup"
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
								format(popupData?.createdAt, 'yyyy年MM月dd日hh時mm分ss秒', {
									locale: ja,
								})}
						</div>
						<div className="font-bold">更新日:</div>
						<div>
							{popupData?.updatedAt &&
								format(popupData?.updatedAt, 'yyyy年MM月dd日hh時mm分ss秒', {
									locale: ja,
								})}
						</div>
					</div>
					<div className="flex flex-row gap-x-2">
						<button
							className="btn btn-error"
							onClick={() => setIsDeletePopupOpen(true)}
						>
							削除
						</button>
						<button
							className="btn btn-outline"
							onClick={() => setIsPopupOpen(false)}
						>
							閉じる
						</button>
					</div>
				</div>
			</Popup>
			<Popup
				id="padlock-delete-popup"
				title="パスワード削除"
				open={isDeletePopupOpen}
				onClose={() => setIsDeletePopupOpen(false)}
			>
				<div className="flex flex-col gap-y-2">
					<p>本当に削除しますか?</p>
					<button
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
				<ErrorMessage error={error} />
			</Popup>
			<Popup
				id="padlock-create-popup"
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
							className="btn btn-outline"
							onClick={() => setIsCreatePopupOpen(false)}
						>
							閉じる
						</button>
					</div>
					<ErrorMessage error={error} />
				</form>
			</Popup>
			<Pagination
				currentPage={currentPage}
				totalPages={pageMax}
				onPageChange={(page) => setCurrentPage(page)}
			/>
			<button className="btn btn-outline" onClick={() => router.push('/admin')}>
				戻る
			</button>
		</div>
	)
}

export default PadLockEdit
