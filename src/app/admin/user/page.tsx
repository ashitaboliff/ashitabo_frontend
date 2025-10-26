import AdminUserPage from '@/app/admin/user/_components'
import { getAllUserDetailsAction } from '@/domains/admin/api/adminActions'
import {
	ADMIN_USER_DEFAULT_QUERY,
	type AdminUserQuery,
	buildAdminUserQueryString,
	parseAdminUserQuery,
} from '@/domains/admin/query/adminUserQuery'
import type { UserDetail } from '@/domains/user/model/userTypes'
import type { ApiError } from '@/types/responseTypes'

type Props = {
	readonly searchParams: Promise<Record<string, string | string[] | undefined>>
}

const Page = async ({ searchParams }: Props) => {
	const urlParams = new URLSearchParams()
	for (const [key, value] of Object.entries(await searchParams)) {
		if (typeof value === 'string') {
			urlParams.set(key, value)
		} else if (Array.isArray(value)) {
			value.forEach((v) => {
				urlParams.append(key, v)
			})
		}
	}

	const { query, extraSearchParams } = parseAdminUserQuery(
		urlParams,
		ADMIN_USER_DEFAULT_QUERY,
	)
	const searchParamsString = buildAdminUserQueryString(
		query,
		ADMIN_USER_DEFAULT_QUERY,
		extraSearchParams,
	)

	let users: UserDetail[] = []
	let totalCount = 0
	let error: ApiError | undefined

	const response = await getAllUserDetailsAction(query)
	if (response.ok) {
		users = response.data.users
		totalCount = response.data.totalCount
	} else {
		error = response
	}

	return (
		<AdminUserPage
			key={searchParamsString}
			users={users}
			totalCount={totalCount}
			defaultQuery={ADMIN_USER_DEFAULT_QUERY}
			initialQuery={query}
			extraSearchParams={extraSearchParams}
			initialError={error}
		/>
	)
}

export default Page
