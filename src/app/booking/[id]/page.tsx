import DetailPage from '@/features/booking/components/Detail'
import DetailNotFoundPage from '@/features/booking/components/DetailNotFound'
import { getBookingByIdAction } from '@/features/booking/actions'
import { BookingDetailProps, BookingTime } from '@/features/booking/types'
import { createMetaData } from '@/hooks/useMetaData'
import { Metadata, ResolvingMetadata } from 'next'
import { StatusCode } from '@/types/responseTypes'
import { cache } from 'react'

type PageParams = Promise<{ id: string }>
type PageProps = { params: PageParams }

const getBookingDetail = cache(async (id: string) => {
	const result = await getBookingByIdAction(id)
	if (result.ok) {
		return result.data as BookingDetailProps
	}
	return null
})

export async function generateMetadata(
	{ params }: { params: PageParams },
	parent: ResolvingMetadata,
): Promise<Metadata> {
	const { id } = await params
	const bookingDetail = await getBookingDetail(id)

	let title = `予約詳細 ${id} | あしたぼホームページ`
	let description = `コマ表の予約詳細 (${id}) です。`

	if (bookingDetail) {
		const bookingData = bookingDetail
		title = bookingData.registName
			? `${bookingData.registName}の予約 | あしたぼホームページ`
			: `予約詳細 ${id} | あしたぼホームページ`
		description = `コマ表の予約 (${bookingData.registName || id}、${bookingData.bookingDate} ${BookingTime[bookingData.bookingTime] || ''}) の詳細です。`
	}

	return createMetaData({
		title,
		description,
		pathname: `/booking/${id}`,
	})
}

const Page = async ({ params }: PageProps) => {
	const bookingDetail = await getBookingDetail((await params).id)
	if (!bookingDetail) {
		return <DetailNotFoundPage />
	}
	return <DetailPage bookingDetail={bookingDetail} />
}

export default Page
