'use client'

import Image from 'next/image'
import type { BandDetails, BandMemberDetails } from '@/features/band/types'
import { FaEdit, FaUsers, FaTrashAlt } from 'react-icons/fa'

interface BandListItemProps {
	band: BandDetails
	onEditBand: (band: BandDetails) => void
	onManageMembers: (band: BandDetails) => void
	onDeleteBand: (bandId: string, bandName: string) => void
	currentUserId?: string
}

export default function BandListItem({
	band,
	onEditBand,
	onManageMembers,
	onDeleteBand,
	currentUserId,
}: BandListItemProps) {
	const MAX_DISPLAY_MEMBERS = 5 // Show first 5 members, then "+X more"
	const displayMembers = band.members.slice(0, MAX_DISPLAY_MEMBERS)
	const remainingMembersCount = band.members.length - displayMembers.length

	// A simple way to check if the current user is a member, for potential UI differences
	// const isCurrentUserMember = currentUserId && band.members.some(member => member.user_id === currentUserId);

	return (
		<div className="card bg-base-100 shadow-xl mb-4">
			<div className="card-body">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
					<h2 className="card-title text-xl font-semibold mb-2 sm:mb-0">
						{band.name}
					</h2>
					<div className="flex gap-2 flex-wrap">
						<button
							onClick={() => onEditBand(band)}
							className="btn btn-sm btn-outline btn-info"
							aria-label={`Edit band ${band.name}`}
						>
							<FaEdit /> バンド名編集
						</button>
						<button
							onClick={() => onManageMembers(band)}
							className="btn btn-sm btn-outline btn-primary"
							aria-label={`Manage members for ${band.name}`}
						>
							<FaUsers /> メンバー管理
						</button>
						<button
							onClick={() => onDeleteBand(band.id, band.name)}
							className="btn btn-sm btn-outline btn-error"
							aria-label={`Delete band ${band.name}`}
						>
							<FaTrashAlt /> 削除
						</button>
					</div>
				</div>

				<div>
					<h3 className="text-md font-medium mb-2">
						メンバー ({band.members.length}人):
					</h3>
					{band.members.length > 0 ? (
						<div className="flex flex-wrap gap-3 items-center">
							{displayMembers.map((member: BandMemberDetails) => (
								<div
									key={member.id}
									className="flex items-center gap-2 p-2 bg-base-200 rounded-lg"
									title={`${member.user.name} (${member.part})`}
								>
									<Image
										src={member.user.image || '/utils/default-avatar.png'}
										alt={member.user.name || 'Member'}
										width={32}
										height={32}
										className="rounded-full"
									/>
									<div>
										<p className="text-sm font-medium truncate max-w-28">
											{member.user.name}
										</p>
										<p className="text-xs text-gray-500">{member.part}</p>
									</div>
								</div>
							))}
							{remainingMembersCount > 0 && (
								<div className="text-sm text-gray-500 self-center">
									+ 他{remainingMembersCount}人
								</div>
							)}
						</div>
					) : (
						<p className="text-sm text-gray-500">
							このバンドにはまだメンバーがいません。
						</p>
					)}
				</div>
			</div>
		</div>
	)
}
