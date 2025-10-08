'use client'

import React from 'react'

interface GenericTableBodyProps<T extends object> {
	isLoading: boolean
	error?: Error | null
	data?: T[]
	renderCells: (item: T) => React.ReactNode // Should return React.ReactNode for <td> elements
	onItemClick?: (item: T) => void
	colSpan: number
	loadingMessage?: string
	errorMessagePrefix?: string
	emptyDataMessage?: string
	itemKeyExtractor: (item: T) => string | number // Function to extract a unique key
	rowClassName?: string
	clickableRowClassName?: string
	noDataCustomMessage?: React.ReactNode // Allows for custom message/component when no data
	renderLoadingSkeleton?: (colSpan: number) => React.ReactNode
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
			// If a custom message/component is provided for no data, render it.
			// It's assumed this custom message will be wrapped in <tr><td> appropriately by the caller or is self-contained.
			// For direct insertion into tbody, it should be a <tr> element.
			// Let's ensure it's wrapped if it's not already a <tr>.
			// A simple way is to expect noDataCustomMessage to be the content of a <td>.
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
