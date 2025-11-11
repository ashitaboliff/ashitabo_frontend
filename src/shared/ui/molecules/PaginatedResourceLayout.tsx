'use client'

import type { ReactNode } from 'react'
import Pagination from '@/shared/ui/atoms/Pagination'
import RadioSortGroup from '@/shared/ui/atoms/RadioSortGroup'
import SelectField from '@/shared/ui/atoms/SelectField'

interface SortOption<T extends string> {
	readonly value: T
	readonly label: string
}

interface PerPageControlProps {
	label: string
	name: string
	options: Record<string, number>
	value: number
	onChange: (value: number) => void
	className?: string
}

interface SortControlProps<T extends string> {
	name: string
	options: SortOption<T>[]
	value: T
	onChange: (value: T) => void
	className?: string
}

interface PaginationControlProps {
	currentPage: number
	totalPages: number
	totalCount: number
	onPageChange: (page: number) => void
	showWhenSinglePage?: boolean
}

interface PaginatedResourceLayoutProps<T extends string> {
	children: ReactNode
	perPage: PerPageControlProps
	sort?: SortControlProps<T>
	pagination?: PaginationControlProps
	className?: string
}

const PaginatedResourceLayout = <T extends string>({
	children,
	perPage,
	sort,
	pagination,
	className = 'flex flex-col justify-center space-y-4',
}: PaginatedResourceLayoutProps<T>) => {
	const shouldShowPagination = (() => {
		if (!pagination) return false
		if (pagination.showWhenSinglePage) {
			return pagination.totalCount > 0
		}
		return pagination.totalPages > 1 && pagination.totalCount > 0
	})()

	return (
		<div className={className}>
			<div className="ml-auto flex w-full flex-row items-center space-x-2 sm:w-1/2 md:w-1/3 lg:w-1/4">
				<p className="whitespace-nowrap text-sm">{perPage.label}</p>
				<SelectField<number>
					name={perPage.name}
					options={perPage.options}
					value={perPage.value}
					onChange={(event) => perPage.onChange(Number(event.target.value))}
					className={perPage.className}
				/>
			</div>
			{sort ? (
				<div className="flex flex-row gap-x-2">
					<RadioSortGroup
						name={sort.name}
						options={sort.options}
						currentSort={sort.value}
						onSortChange={sort.onChange}
						className={sort.className}
					/>
				</div>
			) : null}
			{children}
			{shouldShowPagination && pagination ? (
				<Pagination
					currentPage={pagination.currentPage}
					totalPages={pagination.totalPages}
					onPageChange={pagination.onPageChange}
				/>
			) : null}
		</div>
	)
}

export default PaginatedResourceLayout
