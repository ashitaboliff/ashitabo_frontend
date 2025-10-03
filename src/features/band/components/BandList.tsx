'use client'

import { useState, useEffect } from 'react' // useEffect will be removed or changed
import useSWR from 'swr'
import BandListItem from '@/features/band/components/BandListItem'
import BandFormModal from '@/features/band/components/BandFormModal'
import MemberManagementModal from '@/features/band/components/MemberManagementModal'
import { getUserBandsAction, deleteBandAction } from './actions'
import type { BandDetails } from '@/features/band/types'
import { StatusCode } from '@/types/responseTypes'
import { FaPlusCircle } from 'react-icons/fa'

// SWR fetcher function
const fetchUserBands = async () => {
	const result = await getUserBandsAction()
	if (result.status === StatusCode.OK && Array.isArray(result.response)) {
		return result.response
	}
	// Throw an error or return a specific error object for SWR to handle
	const errorMessage =
		typeof result.response === 'string'
			? result.response
			: 'バンド情報の取得に失敗しました。'
	const error = new Error(errorMessage)
	// You might want to attach a status code or more info to the error object
	// error.info = result;
	throw error
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
		error,
		isLoading,
		mutate,
	} = useSWR<BandDetails[]>('userBands', fetchUserBands)

	const [isBandFormModalOpen, setIsBandFormModalOpen] = useState(false)
	const [bandToEdit, setBandToEdit] = useState<BandDetails | null>(null)

	const [isMemberModalOpen, setIsMemberModalOpen] = useState(false)
	const [bandForMemberManagement, setBandForMemberManagement] =
		useState<BandDetails | null>(null)

	// Local error state for actions, SWR error is for fetching
	const [actionError, setActionError] = useState<string | null>(null)

	// useEffect(() => { // Replaced by useSWR
	// 	if (initialBands.length === 0) {
	// 		fetchBands()
	// 	}
	// }, [initialBands])

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
		setActionError(null)
		const result = await deleteBandAction(bandId)
		if (result.status === StatusCode.NO_CONTENT) {
			mutate() // Trigger SWR revalidation
		} else {
			setActionError(
				typeof result.response === 'string'
					? result.response
					: 'バンドの削除に失敗しました。',
			)
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
	if (actionError) {
		// This could be displayed alongside the list or as a more prominent message
		// For now, let's add it above the list.
		// Consider using a toast notification system for better UX.
	}

	return (
		<div>
			{actionError && (
				<div className="alert alert-error mb-4">操作エラー: {actionError}</div>
			)}
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
