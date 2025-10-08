'use client'

import { type ReactNode } from 'react'

interface GenericTableBodyProps<T extends object> {
	isLoading: boolean
	error?: Error | null
	data?: T[]
	renderCells: (item: T) => ReactNode
	onItemClick?: (item: T) => void
	colSpan: number
	loadingMessage?: string
	errorMessagePrefix?: string
	emptyDataMessage?: string
	itemKeyExtractor: (item: T) => string | number
	rowClassName?: string
	clickableRowClassName?: string
	noDataCustomMessage?: ReactNode
	renderLoadingSkeleton?: (colSpan: number) => ReactNode
}

const GenericTableBody = <T extends object>({
	isLoading,
	error,
	data,
	renderCells,
	onItemClick,
	colSpan,
	loadingMessage = '読み込み中...',
	errorMessagePrefix = 'エラーが発生しました',
	emptyDataMessage = 'データはありません。',
	itemKeyExtractor,
	rowClassName = '',
	clickableRowClassName = 'cursor-pointer hover:bg-base-200',
	noDataCustomMessage,
	renderLoadingSkeleton,
}: GenericTableBodyProps<T>) => {
	if (isLoading) {
		const skeleton = renderLoadingSkeleton?.(colSpan)
		if (skeleton) {
			return <>{skeleton}</>
		}
		return (
			<tr>
				<td colSpan={colSpan} className="text-center py-10">
					{loadingMessage}
				</td>
			</tr>
		)
	}

	if (error) {
		return (
			<tr>
				<td colSpan={colSpan} className="text-center text-error py-10">
					{errorMessagePrefix}: {error.message}
				</td>
			</tr>
		)
	}

	if (!data || data.length === 0) {
		if (noDataCustomMessage) {
			return (
				<tr>
					<td colSpan={colSpan} className="text-center py-10">
						{noDataCustomMessage}
					</td>
				</tr>
			)
		}
		return (
			<tr>
				<td colSpan={colSpan} className="text-center py-10">
					{emptyDataMessage}
				</td>
			</tr>
		)
	}

	return (
		<>
			{data.map((item) => (
				<tr
					key={itemKeyExtractor(item)}
					className={`${rowClassName} ${onItemClick ? clickableRowClassName : ''}`.trim()}
					onClick={onItemClick ? () => onItemClick(item) : undefined}
				>
					{renderCells(item)}
				</tr>
			))}
		</>
	)
}

export default GenericTableBody
