'use client'

import { useState } from 'react'
import useSWR from 'swr'
import BandListItem from '@/features/band/components/BandListItem'
import BandFormModal from '@/features/band/components/BandFormModal'
import MemberManagementModal from '@/features/band/components/MemberManagementModal'
import { getUserBandsAction, deleteBandAction } from './actions'
import type { BandDetails } from '@/features/band/types'
import ErrorMessage from '@/components/ui/atoms/ErrorMessage'
import { ApiError } from '@/types/responseTypes'
import { FaPlusCircle } from 'react-icons/fa'

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
	} = useSWR<BandDetails[]>('userBands', fetchUserBands)

	const [isBandFormModalOpen, setIsBandFormModalOpen] = useState(false)
	const [bandToEdit, setBandToEdit] = useState<BandDetails | null>(null)

	const [isMemberModalOpen, setIsMemberModalOpen] = useState(false)
	const [bandForMemberManagement, setBandForMemberManagement] =
		useState<BandDetails | null>(null)

	const [error, setError] = useState<ApiError | null>(null)
	const handleOpenCreateBandModal = () => {
		setBandToEdit(null)
		setIsBandFormModalOpen(true)
	}

	const handleOpenEditBandModal = (band: BandDetails) => {
		setBandToEdit(band)
		setIsBandFormModalOpen(true)
	}

	const handleOpenMemberManagementModal = (band: BandDetails) => {
		setBandForMemberManagement(band)
		setIsMemberModalOpen(true)
	}

	const handleBandFormSuccess = (updatedOrCreatedBand: BandDetails) => {
		// Refetch all bands to ensure list is up-to-date
		mutate() // Trigger SWR revalidation
		setIsBandFormModalOpen(false)
		setBandToEdit(null)
	}

	const handleBandUpdateFromMemberModal = (updatedBand: BandDetails) => {
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
		setError(null)
		const res = await deleteBandAction(bandId)
		if (res.ok) {
			mutate() // Trigger SWR revalidation
		} else {
			setError(res)
		}
	}

	if (isLoading) {
		// SWR isLoading state
		return (
			<div className="flex justify-center items-center py-10">
				<span className="loading loading-lg loading-spinner text-primary"></span>
			</div>
		)
	}

	// Display action error if any
	if (error) {
		// This could be displayed alongside the list or as a more prominent message
		// For now, let's add it above the list.
		// Consider using a toast notification system for better UX.
	}

	return (
		<div>
			<ErrorMessage error={error} />
			<div className="mb-6 text-right">
				<button
					onClick={handleOpenCreateBandModal}
					className="btn btn-primary btn-md"
				>
					<FaPlusCircle /> 新しいバンドを作成
				</button>
			</div>

			{(!bands || bands.length === 0) &&
				!isLoading && ( // Check if bands data is available
					<div className="text-center py-10">
						<p className="text-lg text-gray-500">
							まだ参加しているバンドはありません。
						</p>
						<p className="text-sm text-gray-400 mt-2">
							新しいバンドを作成してみましょう！
						</p>
					</div>
				)}

			{bands &&
				bands.map((band) => (
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
