import { useMemo, useReducer } from 'react'

export interface UsePagedResourceOptions<S> {
	initialPage?: number
	initialPerPage: number
	initialSort: S
	initialTotalCount?: number
}

interface PagedState<S> {
	page: number
	perPage: number
	sort: S
	totalCount: number
}

type PagedAction<S> =
	| { type: 'SET_PAGE'; page: number }
	| { type: 'SET_PER_PAGE'; perPage: number }
	| { type: 'SET_SORT'; sort: S }
	| { type: 'SET_TOTAL'; totalCount: number }

const clampPage = (page: number, perPage: number, totalCount: number) => {
	const pageCount = Math.max(1, Math.ceil(totalCount / perPage) || 1)
	return Math.min(Math.max(page, 1), pageCount)
}

const pagedReducer = <S>(
	state: PagedState<S>,
	action: PagedAction<S>,
): PagedState<S> => {
	switch (action.type) {
		case 'SET_PAGE': {
			const nextPage = clampPage(action.page, state.perPage, state.totalCount)
			return nextPage === state.page ? state : { ...state, page: nextPage }
		}
		case 'SET_PER_PAGE': {
			const perPage = Math.max(1, action.perPage)
			const nextPage = clampPage(state.page, perPage, state.totalCount)
			return { ...state, perPage, page: nextPage }
		}
		case 'SET_SORT': {
			return { ...state, sort: action.sort, page: 1 }
		}
		case 'SET_TOTAL': {
			const totalCount = Math.max(0, action.totalCount)
			const nextPage = clampPage(state.page, state.perPage, totalCount)
			return { ...state, totalCount, page: nextPage }
		}
		default:
			return state
	}
}

export const usePagedResource = <S>({
	initialPage = 1,
	initialPerPage,
	initialSort,
	initialTotalCount = 0,
}: UsePagedResourceOptions<S>) => {
	const [state, dispatch] = useReducer(pagedReducer<S>, {
		page: Math.max(1, initialPage),
		perPage: Math.max(1, initialPerPage),
		sort: initialSort,
		totalCount: initialTotalCount,
	})

	const pageCount = useMemo(
		() => Math.max(1, Math.ceil(state.totalCount / state.perPage) || 1),
		[state.totalCount, state.perPage],
	)

	const setPage = (page: number) => dispatch({ type: 'SET_PAGE', page })
	const setPerPage = (perPage: number) =>
		dispatch({ type: 'SET_PER_PAGE', perPage })
	const setSort = (sort: S) => dispatch({ type: 'SET_SORT', sort })
	const setTotalCount = (totalCount: number) =>
		dispatch({ type: 'SET_TOTAL', totalCount })

	return {
		state,
		pageCount,
		setPage,
		setPerPage,
		setSort,
		setTotalCount,
	}
}

export type UsePagedResourceReturn<S> = ReturnType<typeof usePagedResource<S>>
