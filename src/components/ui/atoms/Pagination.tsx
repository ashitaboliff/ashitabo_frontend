interface PaginationProps {
	currentPage: number // 現在のページ
	totalPages: number // 総ページ数
	onPageChange: (page: number) => void // ページ変更時のコールバック
}

type PaginationItem = number | 'ellipsis-left' | 'ellipsis-right'

const createPaginationItems = (
	currentPage: number,
	totalPages: number,
	maxMiddleItems = 3,
): PaginationItem[] => {
	if (totalPages <= maxMiddleItems + 4) {
		return Array.from({ length: totalPages }, (_, index) => index + 1)
	}

	const items: PaginationItem[] = [1]
	const halfRange = Math.floor(maxMiddleItems / 2)
	let start = Math.max(2, currentPage - halfRange)
	let end = Math.min(totalPages - 1, currentPage + halfRange)

	if (end - start < maxMiddleItems - 1) {
		if (start === 2) {
			end = Math.min(totalPages - 1, start + maxMiddleItems - 1)
		} else if (end === totalPages - 1) {
			start = Math.max(2, end - (maxMiddleItems - 1))
		}
	}

	if (start > 2) {
		items.push('ellipsis-left')
	}

	for (let page = start; page <= end; page += 1) {
		items.push(page)
	}

	if (end < totalPages - 1) {
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
	const items = createPaginationItems(currentPage, totalPages)

	return (
		<div className="join justify-center">
			{items.map((item, index) => {
				if (typeof item === 'number') {
					return (
						<button
							key={item}
							className={`join-item btn ${
								currentPage === item ? 'btn-primary' : 'btn-outline'
							}`}
							onClick={() => onPageChange(item)}
						>
							{item}
						</button>
					)
				}

				return (
					<button
						key={`${item}-${index}`}
						className="join-item btn btn-disabled"
						disabled
						aria-hidden="true"
					>
						…
					</button>
				)
			})}
		</div>
	)
}

export default Pagination
