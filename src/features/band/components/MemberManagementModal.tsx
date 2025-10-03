'use client'

import { useRef, useState, useEffect, FormEvent, ChangeEvent } from 'react' // useEffect will be modified
import Image from 'next/image'
import useSWR from 'swr'
import SelectField from '@/components/ui/atoms/SelectField' // Import SelectField
import TextInputField from '@/components/ui/atoms/TextInputField' // Import TextInputField
import InfoMessage from '@/components/ui/atoms/InfoMessage' // Import InfoMessage
import {
	addBandMemberAction,
	updateBandMemberAction,
	removeBandMemberAction,
	searchUsersForBandAction,
	getAvailablePartsAction,
	getBandDetailsAction,
} from './actions'
import type {
	BandDetails,
	UserWithProfile,
	Part,
	BandMemberDetails,
	AddBandMemberResponse,
	UpdateBandMemberResponse,
	RemoveBandMemberResponse,
} from '@/features/band/types'
import { StatusCode } from '@/types/responseTypes'
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa'

interface MemberManagementModalProps {
	isOpen: boolean
	onClose: () => void
	band: BandDetails | null
	onBandUpdated: (updatedBand: BandDetails) => void
}

// SWR Fetcher for available parts
const fetcherAvailableParts = async () => {
	const result = await getAvailablePartsAction()
	if (result.status === StatusCode.OK && Array.isArray(result.response)) {
		return result.response
	}
	throw new Error(
		typeof result.response === 'string'
			? result.response
			: 'パート一覧の取得に失敗しました。',
	)
}

// SWR Fetcher for band details
const fetcherBandDetails = async (bandId: string | null) => {
	if (!bandId) return null // Do not fetch if bandId is null
	const result = await getBandDetailsAction(bandId)
	if (
		result.status === StatusCode.OK &&
		result.response &&
		typeof result.response !== 'string'
	) {
		return result.response
	}
	if (result.status === StatusCode.NOT_FOUND) return null // Handle not found specifically
	throw new Error(
		typeof result.response === 'string'
			? result.response
			: 'バンド情報の取得に失敗しました。',
	)
}

export default function MemberManagementModal({
	isOpen,
	onClose,
	band: initialBand, // Renamed to avoid conflict with SWR's data
	onBandUpdated,
}: MemberManagementModalProps) {
	const modalRef = useRef<HTMLDialogElement>(null)

	// SWR for band details
	// The key `band ? `/api/bands/${band.id}` : null` ensures SWR only fetches when `band` is available.
	const {
		data: currentBandDetails,
		error: bandDetailsError,
		mutate: mutateBandDetails,
	} = useSWR<BandDetails | null>(
		initialBand ? `bandDetails/${initialBand.id}` : null, // Unique key for SWR
		() => fetcherBandDetails(initialBand?.id ?? null), // Pass bandId to fetcher
		{
			// fallbackData: initialBand, // Use initialBand from props as fallback
			// Revalidate on focus, useful if data might change outside this modal
			// revalidateOnFocus: true,
		},
	)

	// SWR for available parts
	const { data: availableParts, error: partsError } = useSWR<Part[]>(
		'availableParts',
		fetcherAvailableParts,
	)

	const [searchQuery, setSearchQuery] = useState('')
	const [selectedSearchPart, setSelectedSearchPart] = useState<Part | ''>('')
	const [searchResults, setSearchResults] = useState<UserWithProfile[]>([])
	const [isSearching, setIsSearching] = useState(false)
	const [selectedUserForAdd, setSelectedUserForAdd] =
		useState<UserWithProfile | null>(null)
	const [partForNewMember, setPartForNewMember] = useState<Part | ''>('')
	// const [availableParts, setAvailableParts] = useState<Part[]>([]) // Replaced by SWR
	const [editingMember, setEditingMember] = useState<BandMemberDetails | null>(
		null,
	)
	const [partForEditingMember, setPartForEditingMember] = useState<Part | ''>(
		'',
	)
	const [message, setMessage] = useState<{
		type: 'success' | 'error'
		text: string
	} | null>(null)
	const [isLoadingAction, setIsLoadingAction] = useState(false)

	// useEffect(() => { // Replaced by SWR or handled by SWR's own lifecycle
	// 	setCurrentBandDetails(band)
	// }, [band])

	useEffect(() => {
		if (isOpen) {
			modalRef.current?.showModal()
			// fetchAvailableParts(); // Replaced by SWR
			if (initialBand) {
				mutateBandDetails() // Revalidate band details when modal opens with a band
			}
		} else {
			modalRef.current?.close()
			resetFormState()
		}
	}, [isOpen, initialBand, mutateBandDetails])

	const resetFormState = () => {
		setSearchQuery('')
		setSelectedSearchPart('')
		setSearchResults([])
		setSelectedUserForAdd(null)
		setPartForNewMember('')
		setEditingMember(null)
		setPartForEditingMember('')
		setMessage(null)
	}

	// const fetchAvailableParts = async () => { // Replaced by SWR
	// 	const result = await getAvailablePartsAction()
	// 	if (result.status === StatusCode.OK && Array.isArray(result.response)) {
	// 		setAvailableParts(result.response)
	// 	} else {
	// 		setMessage({ type: 'error', text: 'パート一覧の取得に失敗しました。' })
	// 	}
	// }

	// const fetchBandDetails = async (bandId: string) => { // Replaced by SWR + mutate
	// 	const result = await getBandDetailsAction(bandId)
	// 	if (
	// 		result.status === StatusCode.OK &&
	// 		result.response &&
	// 		typeof result.response !== 'string'
	// 	) {
	// 		// setCurrentBandDetails(result.response) // SWR will update this
	// 		onBandUpdated(result.response)
	// 	} else {
	// 		setMessage({ type: 'error', text: 'バンド情報の更新に失敗しました。' })
	// 	}
	// }

	const handleSearchUsers = async (e?: FormEvent<HTMLFormElement>) => {
		e?.preventDefault()
		if (!searchQuery && !selectedSearchPart) {
			setSearchResults([])
			return
		}
		setIsSearching(true)
		setMessage(null)
		const result = await searchUsersForBandAction(
			searchQuery,
			selectedSearchPart || undefined,
		)
		setIsSearching(false)
		if (result.status === StatusCode.OK && Array.isArray(result.response)) {
			setSearchResults(result.response)
		} else {
			setSearchResults([])
			setMessage({
				type: 'error',
				text:
					typeof result.response === 'string'
						? result.response
						: 'ユーザー検索に失敗しました。',
			})
		}
	}

	const handleAddMember = async () => {
		if (!selectedUserForAdd || !partForNewMember || !currentBandDetails) return
		setIsLoadingAction(true)
		setMessage(null)
		const result = await addBandMemberAction(
			currentBandDetails.id,
			selectedUserForAdd.id,
			partForNewMember,
		)
		setIsLoadingAction(false)
		if (result.status === StatusCode.CREATED) {
			setMessage({
				type: 'success',
				text: `${selectedUserForAdd.name || 'ユーザー'}をメンバーに追加しました。`,
			})
			setSelectedUserForAdd(null)
			setPartForNewMember('')
			setSearchResults([])
			if (currentBandDetails) mutateBandDetails() // Revalidate band details
			if (currentBandDetails && onBandUpdated) {
				// Also call onBandUpdated if needed by parent
				const updatedBandResult = await getBandDetailsAction(
					currentBandDetails.id,
				)
				if (
					updatedBandResult.status === StatusCode.OK &&
					updatedBandResult.response &&
					typeof updatedBandResult.response !== 'string'
				) {
					onBandUpdated(updatedBandResult.response)
				}
			}
		} else {
			setMessage({
				type: 'error',
				text:
					typeof result.response === 'string'
						? result.response
						: 'メンバーの追加に失敗しました。',
			})
		}
	}

	const handleUpdateMemberPart = async (memberId: string) => {
		if (!partForEditingMember || !currentBandDetails) return
		setIsLoadingAction(true)
		setMessage(null)
		const result = await updateBandMemberAction(memberId, partForEditingMember)
		setIsLoadingAction(false)
		if (result.status === StatusCode.OK) {
			setMessage({ type: 'success', text: 'メンバーのパートを更新しました。' })
			setEditingMember(null)
			setPartForEditingMember('')
			if (currentBandDetails) mutateBandDetails() // Revalidate band details
			if (currentBandDetails && onBandUpdated) {
				const updatedBandResult = await getBandDetailsAction(
					currentBandDetails.id,
				)
				if (
					updatedBandResult.status === StatusCode.OK &&
					updatedBandResult.response &&
					typeof updatedBandResult.response !== 'string'
				) {
					onBandUpdated(updatedBandResult.response)
				}
			}
		} else {
			setMessage({
				type: 'error',
				text:
					typeof result.response === 'string'
						? result.response
						: 'パートの更新に失敗しました。',
			})
		}
	}

	const handleRemoveMember = async (
		memberId: string,
		memberName?: string | null,
	) => {
		if (!currentBandDetails) return
		if (!confirm(`${memberName || 'メンバー'}をバンドから削除しますか？`))
			return
		setIsLoadingAction(true)
		setMessage(null)
		const result = await removeBandMemberAction(memberId)
		setIsLoadingAction(false)
		if (result.status === StatusCode.NO_CONTENT) {
			setMessage({
				type: 'success',
				text: `${memberName || 'メンバー'}を削除しました。`,
			})
			if (currentBandDetails) mutateBandDetails() // Revalidate band details
			if (currentBandDetails && onBandUpdated) {
				// After removal, the band details might change (e.g. member count)
				// Fetching again ensures parent has the absolute latest.
				const updatedBandResult = await getBandDetailsAction(
					currentBandDetails.id,
				)
				if (
					updatedBandResult.status === StatusCode.OK &&
					updatedBandResult.response &&
					typeof updatedBandResult.response !== 'string'
				) {
					onBandUpdated(updatedBandResult.response)
				} else if (
					!updatedBandResult.response &&
					updatedBandResult.status === StatusCode.NOT_FOUND
				) {
					// If band is deleted as a side effect (though unlikely here), handle it
					// onBandUpdated(null); // Or some other signal
				}
			}
		} else {
			setMessage({
				type: 'error',
				text:
					typeof result.response === 'string'
						? result.response
						: 'メンバーの削除に失敗しました。',
			})
		}
	}

	return (
		<dialog
			ref={modalRef}
			className="modal modal-bottom sm:modal-middle"
			onClose={onClose}
		>
			<div className="modal-box w-11/12 max-w-3xl">
				<h3 className="font-bold text-lg mb-4">
					メンバー管理: {currentBandDetails?.name || initialBand?.name}
				</h3>

				{message && (
					<InfoMessage
						message={message.text}
						messageType={message.type}
						IconColor={message.type}
					/>
				)}
				{partsError && (
					<InfoMessage
						message={`パート情報の取得エラー: ${partsError.message}`}
						messageType="error"
						IconColor="error"
					/>
				)}
				{bandDetailsError && (
					<InfoMessage
						message={`バンド詳細の取得エラー: ${bandDetailsError.message}`}
						messageType="error"
						IconColor="error"
					/>
				)}

				{/* Add Member Section */}
				<div className="mb-6 p-4 border rounded-md">
					<h4 className="font-semibold mb-2">新しいメンバーを追加</h4>
					<form
						onSubmit={handleSearchUsers}
						className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3 items-end"
					>
						<TextInputField
							type="text"
							placeholder="ユーザー名/IDで検索"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="col-span-1 sm:col-span-1"
						/>
						<SelectField
							name="searchPart"
							options={
								availableParts
									? Object.fromEntries(availableParts.map((p) => [p, p]))
									: {}
							}
							value={selectedSearchPart}
							onChange={(e) =>
								setSelectedSearchPart(e.target.value as Part | '')
							}
							className="col-span-1 sm:col-span-1"
							defaultValue=""
						>
							<option value="">パートで絞り込み</option>
						</SelectField>
						<button
							type="submit"
							className="btn btn-primary col-span-1 sm:col-span-1"
							disabled={isSearching || isLoadingAction}
						>
							{isSearching ? (
								<span className="loading loading-spinner"></span>
							) : (
								'検索'
							)}
						</button>
					</form>

					{searchResults.length > 0 && (
						<div className="max-h-60 overflow-y-auto mb-3">
							<ul className="menu bg-base-200 rounded-box">
								{searchResults.map((user) => (
									<li
										key={user.id}
										onClick={() => {
											setSelectedUserForAdd(user)
											setSearchResults([])
											setSearchQuery(user.name || user.user_id || '')
										}}
									>
										<a>
											<div className="flex items-center gap-2">
												<Image
													src={user.image || '/utils/default-avatar.png'}
													alt={user.name || 'avatar'}
													width={32}
													height={32}
													className="rounded-full"
												/>
												<span>{user.name || user.user_id}</span>
												{user.profile?.part?.length ? (
													<span className="text-xs opacity-70">
														({user.profile.part.join(', ')})
													</span>
												) : (
													''
												)}
											</div>
										</a>
									</li>
								))}
							</ul>
						</div>
					)}

					{selectedUserForAdd && (
						<div className="flex items-end gap-2">
							<div className="flex-grow">
								<label className="label">
									<span className="label-text">
										選択中:{' '}
										{selectedUserForAdd.name || selectedUserForAdd.user_id}
									</span>
								</label>
								<SelectField
									name="newMemberPart"
									options={
										availableParts
											? Object.fromEntries(availableParts.map((p) => [p, p]))
											: {}
									}
									value={partForNewMember}
									onChange={(e) =>
										setPartForNewMember(e.target.value as Part | '')
									}
									disabled={isLoadingAction}
									defaultValue=""
									required
								>
									<option value="" disabled>
										パートを選択
									</option>
								</SelectField>
							</div>
							<button
								onClick={handleAddMember}
								className="btn btn-success"
								disabled={!partForNewMember || isLoadingAction}
							>
								{isLoadingAction ? (
									<span className="loading loading-spinner"></span>
								) : (
									<FaPlus />
								)}{' '}
								追加
							</button>
						</div>
					)}
				</div>

				{/* Current Members Section */}
				<div className="mb-4">
					<h4 className="font-semibold mb-2">
						現在のメンバー ({currentBandDetails?.members?.length || 0}人)
					</h4>
					{currentBandDetails?.members &&
					currentBandDetails.members.length > 0 ? (
						<ul className="space-y-2">
							{currentBandDetails.members.map((member) => (
								<li
									key={member.id}
									className="p-3 border rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
								>
									<div className="flex items-center gap-3 flex-grow">
										<Image
											src={member.user.image || '/utils/default-avatar.png'}
											alt={member.user.name || 'avatar'}
											width={40}
											height={40}
											className="rounded-full"
										/>
										<div>
											<span className="font-medium">
												{member.user.name || member.user.user_id}
											</span>
											{editingMember?.id === member.id ? (
												<SelectField
													name={`editMemberPart-${member.id}`}
													options={
														availableParts
															? Object.fromEntries(
																	availableParts.map((p) => [p, p]),
																)
															: {}
													}
													value={partForEditingMember}
													onChange={(e) =>
														setPartForEditingMember(e.target.value as Part | '')
													}
													disabled={isLoadingAction}
													className="select-sm ml-2"
												/>
											) : (
												<span className="badge badge-ghost ml-2">
													{member.part}
												</span>
											)}
										</div>
									</div>
									<div className="flex gap-2 mt-2 sm:mt-0 flex-shrink-0">
										{editingMember?.id === member.id ? (
											<>
												<button
													onClick={() => handleUpdateMemberPart(member.id)}
													className="btn btn-sm btn-success"
													disabled={!partForEditingMember || isLoadingAction}
												>
													{isLoadingAction ? (
														<span className="loading loading-spinner-xs"></span>
													) : (
														'保存'
													)}
												</button>
												<button
													onClick={() => {
														setEditingMember(null)
														setPartForEditingMember('')
													}}
													className="btn btn-sm btn-ghost"
													disabled={isLoadingAction}
												>
													取消
												</button>
											</>
										) : (
											<button
												onClick={() => {
													setEditingMember(member)
													setPartForEditingMember(member.part)
												}}
												className="btn btn-sm btn-outline btn-info"
												disabled={isLoadingAction}
											>
												<FaEdit /> パート変更
											</button>
										)}
										<button
											onClick={() =>
												handleRemoveMember(
													member.id,
													member.user.name || member.user.user_id,
												)
											}
											className="btn btn-sm btn-outline btn-error"
											disabled={isLoadingAction}
										>
											<FaTrash /> 削除
										</button>
									</div>
								</li>
							))}
						</ul>
					) : (
						<p className="text-sm opacity-70">まだメンバーがいません。</p>
					)}
				</div>

				<div className="modal-action">
					<button
						type="button"
						className="btn"
						onClick={onClose}
						disabled={isLoadingAction}
					>
						閉じる
					</button>
				</div>
			</div>
			<form method="dialog" className="modal-backdrop">
				<button type="button" onClick={onClose}>
					close
				</button>
			</form>
		</dialog>
	)
}
