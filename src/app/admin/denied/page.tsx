import DeniedBookingPage from '@/app/admin/denied/_components'
import { getDeniedBookingAction } from '@/domains/admin/api/deniedBookingActions'
import {
	buildDeniedBookingQueryString,
	DENIED_BOOKING_DEFAULT_QUERY,
	parseDeniedBookingQuery,
} from '@/domains/admin/query/deniedBookingQuery'
import type { DeniedBooking } from '@/domains/booking/model/bookingTypes'
import useFlashMessage from '@/shared/hooks/useFlashMessage'
import { getCurrentJSTDateString } from '@/shared/utils'
import type { ApiError } from '@/types/response'

type Props = {
	readonly searchParams: Promise<Record<string, string | string[] | undefined>>
}

const Page = async ({ searchParams }: Props) => {
	const { type, message } = await useFlashMessage({
		key: 'admin/denied:flash',
	})
	const urlParams = new URLSearchParams()

	for (const [key, value] of Object.entries(await searchParams)) {
		if (typeof value === 'string') {
			urlParams.set(key, value)
		} else if (Array.isArray(value)) {
			value.forEach((item) => {
				urlParams.append(key, item)
			})
		}
	}

	const { query, extraSearchParams } = parseDeniedBookingQuery(
		urlParams,
		DENIED_BOOKING_DEFAULT_QUERY,
	)

	const searchParamsString = buildDeniedBookingQueryString(
		query,
		DENIED_BOOKING_DEFAULT_QUERY,
		extraSearchParams,
	)

	const today = getCurrentJSTDateString()

	let deniedBookings: DeniedBooking[] = []
	let totalCount = 0
	let error: ApiError | undefined

	const response = await getDeniedBookingAction({
		...query,
		today,
	})

	if (response.ok) {
		deniedBookings = response.data.data
		totalCount = response.data.totalCount
	} else {
		error = response
	}

	return (
		<DeniedBookingPage
			key={searchParamsString}
			deniedBookings={deniedBookings}
			totalCount={totalCount}
			defaultQuery={DENIED_BOOKING_DEFAULT_QUERY}
			initialQuery={query}
			extraSearchParams={extraSearchParams}
			initialError={error}
			type={type}
			message={message}
		/>
	)
}

export default Page
