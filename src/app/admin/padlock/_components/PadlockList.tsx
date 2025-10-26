'use client'

import type { PadLock } from '@/domains/admin/model/adminTypes'
import SelectField from '@/shared/ui/atoms/SelectField'
import { TiDeleteOutline } from '@/shared/ui/icons'
import { formatDateTimeJaWithUnits } from '@/shared/utils/dateFormat'

const PER_PAGE_OPTIONS_LABELS: Record<string, number> = {
	'10件': 10,
	'20件': 20,
	'30件': 30,
}

interface PadlockListProps {
	readonly padLocks: PadLock[]
	readonly perPage: number
	readonly onPerPageChange: (perPage: number) => void
	readonly onSelect: (padLock: PadLock) => void
}

const PadlockList = ({
	padLocks,
	perPage,
	onPerPageChange,
	onSelect,
}: PadlockListProps) => {
	return (
		<div className="overflow-x-auto w-full flex flex-col justify-center gap-y-2">
			<div className="flex flex-row items-center ml-auto space-x-2 w-full max-w-xs">
				<p className="text-sm whitespace-nowrap">表示件数:</p>
				<SelectField
					value={perPage}
					onChange={(event) => onPerPageChange(Number(event.target.value))}
					options={PER_PAGE_OPTIONS_LABELS}
					name="padLocksPerPage"
				/>
			</div>
			<table className="table table-zebra table-sm w-full">
				<thead>
					<tr>
						<th></th>
						<th>管理名</th>
						<th>作成日</th>
						<th>更新日</th>
					</tr>
				</thead>
				<tbody>
					{padLocks.length === 0 ? (
						<tr>
							<td colSpan={4} className="text-center py-6 text-sm">
								パスワードが登録されていません。
							</td>
						</tr>
					) : (
						padLocks.map((padLock) => (
							<tr
								key={padLock.id}
								onClick={() => onSelect(padLock)}
								className="cursor-pointer"
							>
								<td className="align-middle">
									{padLock.isDeleted ? (
										<span className="badge badge-error">
											<TiDeleteOutline className="inline" />
										</span>
									) : null}
								</td>
								<td>{padLock.name}</td>
								<td>
									{formatDateTimeJaWithUnits(padLock.createdAt, {
										hour12: true,
									})}
								</td>
								<td>
									{formatDateTimeJaWithUnits(padLock.updatedAt, {
										hour12: true,
									})}
								</td>
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	)
}

export default PadlockList
