import type { Metadata, ResolvingMetadata } from 'next'
import { getBookingByIdAction } from '@/features/booking/actions'
import DetailPage from '@/features/booking/components/Detail'
import DetailNotFoundPage from '@/features/booking/components/DetailNotFound'
import { BOOKING_TIME_LIST } from '@/features/booking/constants'
import { createMetaData } from '@/hooks/useMetaData'

type PageParams = Promise<{ id: string }>
type PageProps = { params: PageParams }

export async function generateMetadata(
	{ params }: { params: PageParams },
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { id } = await params
	const bookingDetailRes = await getBookingByIdAction(id)

	const bookingDetail = bookingDetailRes.ok ? bookingDetailRes.data : null

	let title = `予約詳細 ${id} | あしたぼホームページ`
	let description = `コマ表の予約詳細 (${id}) です。`

	if (bookingDetail) {
		const bookingData = bookingDetail
		title = bookingData.registName
			? `${bookingData.registName}の予約 | あしたぼホームページ`
			: `予約詳細 ${id} | あしたぼホームページ`
		description = `コマ表の予約 (${bookingData.registName || id}、${bookingData.bookingDate} ${BOOKING_TIME_LIST[bookingData.bookingTime] || ''}) の詳細です。`
	}

	return createMetaData({
		title,
		description,
		pathname: `/booking/${id}`,
	})
}

const Page = async ({ params }: PageProps) => {
	const { id } = await params

	const bookingDetail = await getBookingByIdAction(id)
	if (!bookingDetail.ok || !bookingDetail.data) {
		return <DetailNotFoundPage />
	}
	return <DetailPage bookingDetail={bookingDetail.data} />
}

export default Page
