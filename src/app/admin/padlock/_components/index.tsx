'use client'

import { useRouter } from 'next-nprogress-bar'
import { useCallback, useMemo, useState } from 'react'
import PadlockCreateDialog from '@/app/admin/padlock/_components/PadlockCreateDialog'
import PadlockDeleteDialog from '@/app/admin/padlock/_components/PadlockDeleteDialog'
import PadlockDetailDialog from '@/app/admin/padlock/_components/PadlockDetailDialog'
import PadlockList from '@/app/admin/padlock/_components/PadlockList'
import {
	createPadLockAction,
	deletePadLockAction,
} from '@/domains/admin/api/adminActions'
import type {
	PadLock,
	PadLockFormValues,
} from '@/domains/admin/model/adminTypes'
import { useFeedback } from '@/shared/hooks/useFeedback'
import { usePagedResource } from '@/shared/hooks/usePagedResource'
import Pagination from '@/shared/ui/atoms/Pagination'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'

interface Props {
	readonly padLocks: PadLock[]
}

const PadLockManagement = ({ padLocks }: Props) => {
	const router = useRouter()
	const feedback = useFeedback()
	const [selectedPadLock, setSelectedPadLock] = useState<PadLock | null>(null)
	const [isDetailOpen, setIsDetailOpen] = useState(false)
	const [isCreateOpen, setIsCreateOpen] = useState(false)
	const [isDeleteOpen, setIsDeleteOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)

	const {
		state: { page, perPage },
		pageCount,
		setPage,
		setPerPage,
	} = usePagedResource<'default'>({
		initialPerPage: 10,
		initialSort: 'default',
		initialTotalCount: padLocks.length,
	})

	const visiblePadLocks = useMemo(() => {
		const start = (page - 1) * perPage
		return padLocks.slice(start, start + perPage)
	}, [padLocks, page, perPage])

	const handleSelectPadLock = useCallback((padLock: PadLock) => {
		setSelectedPadLock(padLock)
		setIsDetailOpen(true)
	}, [])

	const handlePerPageChange = useCallback(
		(nextPerPage: number) => {
			setPerPage(nextPerPage)
			setPage(1)
		},
		[setPage, setPerPage],
	)

	const handleCreatePadLock = useCallback(
		async (values: PadLockFormValues) => {
			feedback.clearFeedback()
			setIsSubmitting(true)
			const res = await createPadLockAction(values)
			setIsSubmitting(false)

			if (res.ok) {
				feedback.showSuccess('パスワードを作成しました。')
				setIsCreateOpen(false)
				router.refresh()
				return true
			}

			feedback.showApiError(res)
			return false
		},
		[feedback, router],
	)

	const handleDeletePadLock = useCallback(async () => {
		if (!selectedPadLock) return

		feedback.clearFeedback()
		setIsDeleting(true)
		const res = await deletePadLockAction({ id: selectedPadLock.id })
		setIsDeleting(false)

		if (res.ok) {
			feedback.showSuccess('パスワードを削除しました。')
			setIsDeleteOpen(false)
			setIsDetailOpen(false)
			router.refresh()
		} else {
			feedback.showApiError(res)
		}
	}, [feedback, router, selectedPadLock])

	return (
		<div className="flex flex-col items-center justify-center gap-y-3">
			<h1 className="text-2xl font-bold">ログイン用パスワード管理</h1>
			<p className="text-sm text-center">
				このページではアカウント新規作成時のログイン用パスワードを管理できます。
				<br />
				部室の4桁パスワードを年間で管理するほか、OB・OG
				用のパスワード発行にも利用できます。
			</p>
			<button
				type="button"
				className="btn btn-primary btn-outline"
				onClick={() => {
					feedback.clearFeedback()
					setIsCreateOpen(true)
				}}
			>
				パスワードを新規作成
			</button>
			<FeedbackMessage source={feedback.feedback} />
			<PadlockList
				padLocks={visiblePadLocks}
				perPage={perPage}
				onPerPageChange={handlePerPageChange}
				onSelect={handleSelectPadLock}
			/>
			{pageCount > 1 ? (
				<Pagination
					currentPage={page}
					totalPages={pageCount}
					onPageChange={setPage}
				/>
			) : null}

			<button
				type="button"
				className="btn btn-outline"
				onClick={() => router.push('/admin')}
			>
				戻る
			</button>

			<PadlockDetailDialog
				padLock={selectedPadLock}
				open={isDetailOpen}
				onRequestDelete={() => setIsDeleteOpen(true)}
				onClose={() => setIsDetailOpen(false)}
			/>
			<PadlockDeleteDialog
				open={isDeleteOpen}
				onClose={() => setIsDeleteOpen(false)}
				onConfirm={handleDeletePadLock}
				isDeleting={isDeleting}
			/>
			<PadlockCreateDialog
				open={isCreateOpen}
				onClose={() => setIsCreateOpen(false)}
				onSubmit={handleCreatePadLock}
				isSubmitting={isSubmitting}
			/>
		</div>
	)
}

export default PadLockManagement
