'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { FeedbackMessage as FeedbackMessageView } from '@/components/ui/atoms/Message'
import { FaPlusCircle } from '@/components/ui/icons'
import BandFormModal from '@/features/band/components/BandFormModal'
import BandListItem from '@/features/band/components/BandListItem'
import MemberManagementModal from '@/features/band/components/MemberManagementModal'
import type { BandDetails } from '@/features/band/types'
import { useFeedback } from '@/hooks/useFeedback'
import { deleteBandAction, getUserBandsAction } from '../actions'

// SWR fetcher function
const fetchUserBands = async () => {
	const res = await getUserBandsAction()
	if (res.ok) {
		return res.data
	}
	throw res
}

interface BandListProps {
	// initialBands is handled by SWR's fallbackData or initialData if needed,
	// but for client-side fetching, it might not be directly used in the same way.
	// For simplicity, we'll rely on SWR to fetch.
	currentUserId?: string
}

export default function BandList({ currentUserId }: BandListProps) {
	const {
		data: bands,
		isLoading,
		mutate,
		error,
	} = useSWR<BandDetails[]>('userBands', fetchUserBands)

	const [isBandFormModalOpen, setIsBandFormModalOpen] = useState(false)
	const [bandToEdit, setBandToEdit] = useState<BandDetails | null>(null)

	const [isMemberModalOpen, setIsMemberModalOpen] = useState(false)
	const [bandForMemberManagement, setBandForMemberManagement] =
		useState<BandDetails | null>(null)

	const feedback = useFeedback()

	const handleOpenCreateBandModal = () => {
		setBandToEdit(null)
		setIsBandFormModalOpen(true)
		feedback.clearFeedback()
	}

	const handleOpenEditBandModal = (band: BandDetails) => {
		setBandToEdit(band)
		setIsBandFormModalOpen(true)
		feedback.clearFeedback()
	}

	const handleOpenMemberManagementModal = (band: BandDetails) => {
		setBandForMemberManagement(band)
		setIsMemberModalOpen(true)
	}

	const handleBandFormSuccess = (
		updatedOrCreatedBand: BandDetails,
		mode: 'create' | 'update',
	) => {
		mutate() // Trigger SWR revalidation
		setIsBandFormModalOpen(false)
		setBandToEdit(null)
		if (mode === 'create') {
			feedback.showSuccess(
				`バンド「${updatedOrCreatedBand.name}」を作成しました。`,
			)
		} else {
			feedback.showSuccess(
				`バンド「${updatedOrCreatedBand.name}」を更新しました。`,
			)
		}
	}

	const handleBandUpdateFromMemberModal = () => {
		mutate() // Trigger SWR revalidation
	}

	const handleDeleteBand = async (bandId: string, bandName: string) => {
		if (
			!confirm(
				`バンド「${bandName}」を削除してもよろしいですか？この操作は元に戻せません。`,
			)
		) {
			return
		}
		feedback.clearFeedback()
		const res = await deleteBandAction(bandId)
		if (res.ok) {
			mutate()
			feedback.showSuccess(`バンド「${bandName}」を削除しました。`)
		} else {
			feedback.showApiError(res)
		}
	}

	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-10">
				<span className="loading loading-lg loading-spinner text-primary"></span>
			</div>
		)
	}

	return (
		<div>
			<FeedbackMessageView source={feedback.feedback} />
			<FeedbackMessageView source={error} defaultVariant="error" />
			<div className="mb-6 text-right">
				<button
					onClick={handleOpenCreateBandModal}
					className="btn btn-primary btn-md"
					type="button"
				>
					<FaPlusCircle /> 新しいバンドを作成
				</button>
			</div>

			{error && !bands && (
				<div className="text-center py-10 text-error">
					バンド一覧の取得に失敗しました。時間をおいて再度お試しください。
				</div>
			)}

			{(!bands || bands.length === 0) && !isLoading && !error && (
				<div className="text-center py-10">
					<p className="text-lg text-gray-500">
						まだ参加しているバンドはありません。
					</p>
					<p className="text-sm text-gray-400 mt-2">
						新しいバンドを作成してみましょう！
					</p>
				</div>
			)}

			{bands?.map((band) => (
				<BandListItem
					key={band.id}
					band={band}
					onEditBand={handleOpenEditBandModal}
					onManageMembers={handleOpenMemberManagementModal}
					onDeleteBand={handleDeleteBand}
					currentUserId={currentUserId}
				/>
			))}

			{isBandFormModalOpen && (
				<BandFormModal
					isOpen={isBandFormModalOpen}
					onClose={() => setIsBandFormModalOpen(false)}
					bandToEdit={bandToEdit}
					onFormSubmitSuccess={handleBandFormSuccess}
				/>
			)}

			{isMemberModalOpen && bandForMemberManagement && (
				<MemberManagementModal
					isOpen={isMemberModalOpen}
					onClose={() => setIsMemberModalOpen(false)}
					band={bandForMemberManagement}
					onBandUpdated={handleBandUpdateFromMemberModal}
				/>
			)}
		</div>
	)
}
