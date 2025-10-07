'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import InstIcon from '@/components/ui/atoms/InstIcon'
import TextSearchField from '@/components/ui/molecules/TextSearchField'
import Popup from '@/components/ui/molecules/Popup'
import { getAllUsersForSelectAction, UserForSelect } from '@/core/actions'
import { Part, PartMap } from '@/features/user/types'
import { LuUserRound } from 'react-icons/lu'
import { LuCheck } from 'react-icons/lu'

const UserSelectPopup = ({
	open,
	onClose,
	userSelect,
	onUserSelect,
	singleSelect = false,
}: {
	open: boolean
	onClose: () => void
	userSelect: string[] // 既存のユーザー選択、ユーザーIDの配列
	onUserSelect: (userIds: string[]) => void // ユーザー選択時のコールバック
	singleSelect?: boolean // 単一選択モード
}) => {
	const [searchQuery, setSearchQuery] = useState<string>('')
	const [users, setUsers] = useState<UserForSelect[]>([])
	const [allUsers, setAllUsers] = useState<UserForSelect[]>([])
	const [selectedUsers, setSelectedUsers] = useState<string[]>(userSelect || [])

	useEffect(() => {
		const fetchUsers = async () => {
			const response = await getAllUsersForSelectAction()
			if (response.ok) {
				setUsers(response.data ?? [])
				setAllUsers(response.data ?? [])
			} else {
				console.error('ユーザーの取得に失敗しました', response.message)
			}
		}
		fetchUsers()
	}, [])

	const handleSearch = (query: string) => {
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
	}

	const handleUserSelect = (userId: string) => {
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
	}

	const handleConfirm = () => {
		onUserSelect(selectedUsers)
		onClose()
	}

	return (
		<Popup
			id="user-select-popup"
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
				{users.map((user) => (
					<div
						key={user.id}
						className={`p-2 hover:bg-gray-100 cursor-pointer ${
							selectedUsers.includes(user.id!) ? 'bg-gray-50 opacity-70' : ''
						}`}
						onClick={() => handleUserSelect(user.id!)}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								{user.image ? (
									<Image
										src={user.image}
										alt={user.name!}
										width={32}
										height={32}
										onError={(e) => {
											e.currentTarget.style.display = 'none'
											e.currentTarget.nextElementSibling?.classList.remove(
												'hidden',
											)
										}}
										className="rounded-full bg-white mr-2"
									/>
								) : (
									<LuUserRound className="w-8 h-8 text-base-300 rounded-full bg-white mr-2" />
								)}
								<LuUserRound className="w-8 h-8 text-base-300 hidden rounded-full bg-white mr-2" />
								<div className="flex flex-col">
									<span className="font-semibold">{user.name}</span>
									{user.profile?.name && (
										<span className="text-sm text-gray-600">
											{user.profile.name}
										</span>
									)}
									{user.profile?.part && user.profile.part.length > 0 && (
										<InstIcon part={user.profile.part} size={16} />
									)}
								</div>
							</div>
							{selectedUsers.includes(user.id!) && (
								<LuCheck className="w-6 h-6 text-primary" />
							)}
						</div>
					</div>
				))}
			</div>
			<div className="p-4 border-t bg-white flex justify-between items-center">
				<div className="flex-1">
					{selectedUsers.length > 0 ? (
						<div className="avatar-group -space-x-6 h-14">
							{selectedUsers.map((userId) => {
								const user = users.find((u) => u.id === userId)
								return user ? (
									<div
										key={user.id}
										className="flex flex-col items-center"
										onClick={() => handleUserSelect(user.id!)}
									>
										<div className="rounded-full bg-white avatar">
											{user.image ? (
												<Image
													src={user.image}
													alt={user.name!}
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
												<LuUserRound className="w-12 h-12 text-base-300" />
											)}
											<LuUserRound className="w-12 h-12 text-base-300 hidden" />
										</div>
										<div
											className="tooltip tooltip-bottom -mt-6"
											data-tip={user.name}
										>
											<span className="text-xxs bg-white text-gray-800 rounded-full border p-1">
												{user.profile?.name || user.name}
											</span>
										</div>
									</div>
								) : null
							})}
						</div>
					) : (
						<div className="h-14 flex items-center">
							<span className="text-sm text-gray-500">
								ユーザーを選択してください
							</span>
						</div>
					)}
				</div>
				{!singleSelect && (
					<button
						onClick={handleConfirm}
						className="ml-4 btn btn-primary btn-sm"
					>
						決定する
					</button>
				)}
			</div>
		</Popup>
	)
}

export default UserSelectPopup
