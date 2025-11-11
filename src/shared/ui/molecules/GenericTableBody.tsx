'use client'

import type { ReactNode } from 'react'
import type { MessageSource } from '@/shared/ui/molecules/FeedbackMessage'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'

interface TableHeader {
	key: string
	label: ReactNode
}

interface GenericTableProps<T extends object> {
	headers: TableHeader[]
	data?: T[]
	isLoading: boolean
	error?: MessageSource
	renderCells: (item: T) => ReactNode
	onRowClick?: (item: T) => void
	tableClassName?: string
	rowClassName?: string
	clickableRowClassName?: string
	loadingMessage?: string
	emptyDataMessage?: string
	itemKeyExtractor: (item: T) => string | number
	colSpan?: number
}

const GenericTable = <T extends object>({
	headers,
	data,
	isLoading,
	error,
	renderCells,
	onRowClick,
	tableClassName = 'table-sm w-full',
	rowClassName = '',
	clickableRowClassName = 'cursor-pointer hover:bg-base-200',
	loadingMessage = '読み込み中...',
	emptyDataMessage = 'データはありません。',
	itemKeyExtractor,
	colSpan,
}: GenericTableProps<T>) => {
	const effectiveColSpan = colSpan ?? Math.max(headers.length, 1)

	return (
		<div className="w-full overflow-x-auto rounded-box border border-base-content/5 bg-white">
			<table className={`table ${tableClassName}`}>
				<thead>
					<tr>
						{headers.map((header) => (
							<th key={header.key} className="font-bold">
								{header.label}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{isLoading ? (
						<tr>
							<td colSpan={effectiveColSpan} className="py-10 text-center">
								{loadingMessage}
							</td>
						</tr>
					) : error ? (
						<tr>
							<td colSpan={effectiveColSpan} className="py-6">
								<FeedbackMessage source={error} />
							</td>
						</tr>
					) : !data || data.length === 0 ? (
						<tr>
							<td colSpan={effectiveColSpan} className="py-10 text-center">
								{emptyDataMessage}
							</td>
						</tr>
					) : (
						data.map((item) => (
							<tr
								key={itemKeyExtractor(item)}
								className={`${rowClassName} ${onRowClick ? clickableRowClassName : ''}`.trim()}
								onClick={onRowClick ? () => onRowClick(item) : undefined}
							>
								{renderCells(item)}
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	)
}

export default GenericTable
