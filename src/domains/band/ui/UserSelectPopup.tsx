'use client'

import Image from 'next/image'
import { memo, useCallback, useEffect, useId, useState } from 'react'
import { getUsersForSelect } from '@/domains/user/api/userActions'
import {
	type Part,
	PartMap,
	type UserForSelect,
} from '@/domains/user/model/userTypes'
import InstIcon from '@/shared/ui/atoms/InstIcon'
import { LuCheck, LuUserRound } from '@/shared/ui/icons'
import Popup from '@/shared/ui/molecules/Popup'
import TextSearchField from '@/shared/ui/molecules/TextSearchField'
import { logError } from '@/shared/utils/logger'

interface Props {
	readonly open: boolean
	readonly onClose: () => void
	readonly userSelect: string[] // 既存のユーザー選択、ユーザーIDの配列
	readonly onUserSelect: (userIds: string[]) => void // ユーザー選択時のコールバック
	readonly singleSelect?: boolean // 単一選択モード
}

const UserSelectPopupComponent = ({
	open,
	onClose,
	userSelect,
	onUserSelect,
	singleSelect = false,
}: Props) => {
	const [searchQuery, setSearchQuery] = useState<string>('')
	const [users, setUsers] = useState<UserForSelect[]>([])
	const [allUsers, setAllUsers] = useState<UserForSelect[]>([])
	const [selectedUsers, setSelectedUsers] = useState<string[]>(userSelect || [])
	const popupId = useId()

	useEffect(() => {
		const fetchUsers = async () => {
			const response = await getUsersForSelect()
			if (response.ok) {
				setUsers(response.data ?? [])
				setAllUsers(response.data ?? [])
			} else {
				logError('ユーザーの取得に失敗しました', response)
			}
		}
		fetchUsers()
	}, [])

	const handleSearch = useCallback(
		(query: string) => {
			setSearchQuery(query)
			const filteredUsers = allUsers.filter(
				(user) =>
					user.name?.toLowerCase().includes(query.toLowerCase()) ||
					user.profile?.name?.toLowerCase().includes(query.toLowerCase()) ||
					user.profile?.part?.some((part) =>
						PartMap[part as Part]?.toLowerCase().includes(query.toLowerCase()),
					),
			)
			setUsers(filteredUsers)
		},
		[allUsers],
	)

	const handleUserSelect = useCallback(
		(userId: string) => {
			if (singleSelect) {
				// 単一選択モード
				const newSelectedUsers = [userId]
				setSelectedUsers(newSelectedUsers)
				onUserSelect(newSelectedUsers)
				onClose()
			} else {
				// 複数選択モード
				const newSelectedUsers = selectedUsers.includes(userId)
					? selectedUsers.filter((id) => id !== userId)
					: [...selectedUsers, userId]
				setSelectedUsers(newSelectedUsers)
			}
		},
		[onClose, onUserSelect, selectedUsers, singleSelect],
	)

	const handleConfirm = useCallback(() => {
		onUserSelect(selectedUsers)
		onClose()
	}, [onClose, onUserSelect, selectedUsers])

	return (
		<Popup
			id={popupId}
			title="ユーザー選択"
			open={open}
			onClose={onClose}
			maxWidth="max-w-2xl"
			noPadding
			className=""
		>
			<TextSearchField
				placeholder="LINEの名前、本名、楽器で検索"
				value={searchQuery}
				onChange={(e) => handleSearch(e.target.value)}
			/>
			<div className="mt-4 max-h-96 overflow-y-auto">
				{users.map((user) => {
					if (!user.id) {
						return null
					}
					const isSelected = selectedUsers.includes(user.id)
					const handleClick = () => handleUserSelect(user.id)
					return (
						<button
							key={user.id}
							type="button"
							className={`w-full cursor-pointer p-2 text-left hover:bg-gray-100 ${
								isSelected ? 'bg-gray-50 opacity-70' : ''
							}`}
							onClick={handleClick}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center">
									{user.image ? (
										<Image
											src={user.image}
											alt={user.name ?? 'ユーザーアイコン'}
											width={32}
											height={32}
											onError={(e) => {
												e.currentTarget.style.display = 'none'
												e.currentTarget.nextElementSibling?.classList.remove(
													'hidden',
												)
											}}
											className="mr-2 rounded-full bg-white"
										/>
									) : (
										<LuUserRound className="mr-2 h-8 w-8 rounded-full bg-white text-base-300" />
									)}
									<LuUserRound className="mr-2 hidden h-8 w-8 rounded-full bg-white text-base-300" />
									<div className="flex flex-col">
										<span className="font-semibold">{user.name}</span>
										{user.profile?.name && (
											<span className="text-gray-600 text-sm">
												{user.profile.name}
											</span>
										)}
										{user.profile?.part && user.profile.part.length > 0 && (
											<InstIcon part={user.profile.part} size={16} />
										)}
									</div>
								</div>
								{isSelected && <LuCheck className="h-6 w-6 text-primary" />}
							</div>
						</button>
					)
				})}
			</div>
			<div className="flex items-center justify-between border-t bg-white p-4">
				<div className="flex-1">
					{selectedUsers.length > 0 ? (
						<div className="avatar-group -space-x-6 h-14">
							{selectedUsers.map((userId) => {
								const user = users.find((u) => u.id === userId)
								return user ? (
									<button
										key={user.id}
										type="button"
										className="flex flex-col items-center"
										onClick={() => user.id && handleUserSelect(user.id)}
									>
										<div className="avatar rounded-full bg-white">
											{user.image ? (
												<Image
													src={user.image}
													alt={user.name ?? 'ユーザーアイコン'}
													width={40}
													height={40}
													onError={(e) => {
														e.currentTarget.style.display = 'none'
														e.currentTarget.nextElementSibling?.classList.remove(
															'hidden',
														)
													}}
												/>
											) : (
												<LuUserRound className="h-12 w-12 text-base-300" />
											)}
											<LuUserRound className="hidden h-12 w-12 text-base-300" />
										</div>
										<div
											className="tooltip tooltip-bottom -mt-6"
											data-tip={user.name}
										>
											<span className="rounded-full border bg-white p-1 text-gray-800 text-xxs">
												{user.profile?.name || user.name}
											</span>
										</div>
									</button>
								) : null
							})}
						</div>
					) : (
						<div className="flex h-14 items-center">
							<span className="text-gray-500 text-sm">
								ユーザーを選択してください
							</span>
						</div>
					)}
				</div>
				{!singleSelect && (
					<button
						type="button"
						onClick={handleConfirm}
						className="btn btn-primary btn-sm ml-4"
					>
						決定する
					</button>
				)}
			</div>
		</Popup>
	)
}

const UserSelectPopup = memo(UserSelectPopupComponent)

UserSelectPopup.displayName = 'UserSelectPopup'

export default UserSelectPopup
