import { memo, useCallback, useMemo } from 'react'

interface PaginationProps {
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
}

type PaginationItem = number | 'ellipsis-left' | 'ellipsis-right'

const EDGE_ITEM_COUNT = 2

export const createPaginationItems = (
	currentPage: number,
	totalPages: number,
	maxMiddleItems = 3,
): PaginationItem[] => {
	if (totalPages <= maxMiddleItems + EDGE_ITEM_COUNT * 2) {
		return Array.from({ length: totalPages }, (_, index) => index + 1)
	}

	const items: PaginationItem[] = [1]
	const pagesAroundCurrent = Math.floor(maxMiddleItems / 2)

	let windowStart = Math.max(2, currentPage - pagesAroundCurrent)
	let windowEnd = Math.min(totalPages - 1, currentPage + pagesAroundCurrent)

	if (windowEnd - windowStart < maxMiddleItems - 1) {
		if (windowStart === 2) {
			windowEnd = Math.min(totalPages - 1, windowStart + maxMiddleItems - 1)
		} else if (windowEnd === totalPages - 1) {
			windowStart = Math.max(2, windowEnd - (maxMiddleItems - 1))
		}
	}

	if (windowStart > 2) {
		items.push('ellipsis-left')
	}

	for (let page = windowStart; page <= windowEnd; page += 1) {
		items.push(page)
	}

	if (windowEnd < totalPages - 1) {
		items.push('ellipsis-right')
	}

	items.push(totalPages)
	return items
}

const Pagination = ({
	currentPage,
	totalPages,
	onPageChange,
}: PaginationProps) => {
	const items = useMemo(
		() => createPaginationItems(currentPage, totalPages),
		[currentPage, totalPages],
	)

	const handlePageClick = useCallback(
		(page: number) => () => {
			onPageChange(page)
		},
		[onPageChange],
	)

	return (
		<div className="join mx-auto my-4 justify-center">
			{items.map((item) => {
				if (typeof item === 'number') {
					return (
						<button
							type="button"
							key={item}
							className={`join-item btn ${
								currentPage === item ? 'btn-primary' : 'btn-outline'
							}`}
							onClick={handlePageClick(item)}
						>
							{item}
						</button>
					)
				}

				return (
					<button
						type="button"
						key={item}
						className="join-item btn btn-disabled"
						disabled
					>
						…
					</button>
				)
			})}
		</div>
	)
}

export default memo(Pagination)
