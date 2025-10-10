import { describe, expect, it } from 'vitest'
import { createPaginationItems } from '../Pagination'

describe('createPaginationItems', () => {
	it('returns full range when total pages are small', () => {
		expect(createPaginationItems(1, 4)).toEqual([1, 2, 3, 4])
	})

	it('includes ellipsis when there is a gap at the beginning', () => {
		expect(createPaginationItems(5, 10)).toEqual([1, 'ellipsis-left', 4, 5, 6, 'ellipsis-right', 10])
	})

	it('includes ellipsis when there is a gap at the end', () => {
		expect(createPaginationItems(2, 10)).toEqual([1, 2, 3, 'ellipsis-right', 10])
	})

	it('handles current page near the end', () => {
		expect(createPaginationItems(9, 10)).toEqual([1, 'ellipsis-left', 8, 9, 10])
	})

	it('handles current page in the middle', () => {
		expect(createPaginationItems(6, 12)).toEqual([1, 'ellipsis-left', 5, 6, 7, 'ellipsis-right', 12])
	})
})
