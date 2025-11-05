'use client'

import Image from 'next/image'
import type {
	BandDetails,
	BandMemberDetails,
} from '@/domains/band/model/bandTypes'
import { FaEdit, FaTrashAlt, FaUsers } from '@/shared/ui/icons'

interface Props {
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
}: Props) {
	const MAX_DISPLAY_MEMBERS = 5 // Show first 5 members, then "+X more"
	const displayMembers = band.members.slice(0, MAX_DISPLAY_MEMBERS)
	const remainingMembersCount = band.members.length - displayMembers.length
	const isCurrentUserMember =
		currentUserId != null &&
		band.members.some((member) => member.userId === currentUserId)

	// A simple way to check if the current user is a member, for potential UI differences
	return (
		<div className="card mb-4 bg-base-100 shadow-xl">
			<div className="card-body">
				<div className="mb-3 flex flex-col items-start justify-between sm:flex-row sm:items-center">
					<h2 className="card-title mb-2 font-semibold text-xl sm:mb-0">
						{band.name}
						{isCurrentUserMember && (
							<span className="badge badge-primary badge-sm ml-2">所属中</span>
						)}
					</h2>
					<div className="flex flex-wrap gap-2">
						<button
							onClick={() => onEditBand(band)}
							className="btn btn-sm btn-outline btn-info"
							aria-label={`Edit band ${band.name}`}
							type="button"
						>
							<FaEdit /> バンド名編集
						</button>
						<button
							onClick={() => onManageMembers(band)}
							className="btn btn-sm btn-outline btn-primary"
							aria-label={`Manage members for ${band.name}`}
							type="button"
						>
							<FaUsers /> メンバー管理
						</button>
						<button
							onClick={() => onDeleteBand(band.id, band.name)}
							className="btn btn-sm btn-outline btn-error"
							aria-label={`Delete band ${band.name}`}
							type="button"
						>
							<FaTrashAlt /> 削除
						</button>
					</div>
				</div>

				<div>
					<h3 className="mb-2 font-medium text-md">
						メンバー ({band.members.length}人):
					</h3>
					{band.members.length > 0 ? (
						<div className="flex flex-wrap items-center gap-3">
							{displayMembers.map((member: BandMemberDetails) => (
								<div
									key={member.id}
									className="flex items-center gap-2 rounded-lg bg-base-200 p-2"
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
										<p className="max-w-28 truncate font-medium text-sm">
											{member.user.name}
										</p>
										<p className="text-gray-500 text-xs">{member.part}</p>
									</div>
								</div>
							))}
							{remainingMembersCount > 0 && (
								<div className="self-center text-gray-500 text-sm">
									+ 他{remainingMembersCount}人
								</div>
							)}
						</div>
					) : (
						<p className="text-gray-500 text-sm">
							このバンドにはまだメンバーがいません。
						</p>
					)}
				</div>
			</div>
		</div>
	)
}
