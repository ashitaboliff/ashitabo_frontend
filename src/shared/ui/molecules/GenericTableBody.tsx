'use client'

import type { ReactNode } from 'react'
import FeedbackMessage from '@/shared/ui/molecules/FeedbackMessage'
import type { FeedbackMessageType } from '@/types/feedback'

interface GenericTableBodyProps<T extends object> {
	isLoading: boolean
	error?: FeedbackMessageType | null
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
				<td colSpan={colSpan} className="py-10 text-center">
					{loadingMessage}
				</td>
			</tr>
		)
	}

	if (error) {
		return (
			<tr>
				<td colSpan={colSpan} className="py-6">
					<FeedbackMessage source={error} />
				</td>
			</tr>
		)
	}

	if (!data || data.length === 0) {
		if (noDataCustomMessage) {
			return (
				<tr>
					<td colSpan={colSpan} className="py-10 text-center">
						{noDataCustomMessage}
					</td>
				</tr>
			)
		}
		return (
			<tr>
				<td colSpan={colSpan} className="py-10 text-center">
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
