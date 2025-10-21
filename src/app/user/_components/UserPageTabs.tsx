'use client'

import dynamic from 'next/dynamic'
import { type ReactNode, useCallback, useState } from 'react'
import BookingLogs from '@/app/user/_components/BookingLogs'
import GachaLogs from '@/app/user/_components/GachaLogs'
import { useGachaPlayManager } from '@/domains/gacha/hooks/useGachaPlayManager'
import type { CarouselPackDataItem } from '@/domains/gacha/model/gachaTypes'
import { gkktt } from '@/shared/lib/fonts'
import { Tab, Tabs } from '@/shared/ui/atoms/Tabs'
import {
	GiCardRandom,
	GiGuitarHead,
	MdOutlineEditCalendar,
} from '@/shared/ui/icons'
import type { Session } from '@/types/session'

const GachaMainPopup = dynamic(
	() => import('@/domains/gacha/ui/GachaMainPopup'),
	{
		ssr: false,
		loading: () => null,
	},
) as typeof import('@/domains/gacha/ui/GachaMainPopup')['default']

const RatioPopup = dynamic(() => import('@/domains/gacha/ui/RatioPopup'), {
	ssr: false,
	loading: () => (
		<button type="button" className="btn btn-outline w-full sm:w-auto">
			提供割合
		</button>
	),
}) as typeof import('@/domains/gacha/ui/RatioPopup')['default']

interface Props {
	readonly session: Session
	readonly gachaCarouselData: CarouselPackDataItem[]
}

const UserPageTabs = ({ session, gachaCarouselData }: Props) => {
	const [isGachaPopupOpen, setIsGachaPopupOpen] = useState(false)

	const {
		canPlayGacha,
		gachaPlayCountToday,
		gachaMessage,
		onGachaPlayedSuccessfully,
		MAX_GACHA_PLAYS_PER_DAY,
	} = useGachaPlayManager({ userId: session.user.id })

	const handleOpenGachaPopup = useCallback(() => {
		if (!canPlayGacha) {
			return
		}
		setIsGachaPopupOpen(true)
	}, [canPlayGacha])

	const tabs: { id: string; label: ReactNode; content: ReactNode }[] = [
		{
			id: 'booking',
			label: <MdOutlineEditCalendar size={30} />,
			content: <BookingLogs session={session} />,
		},
		{
			id: 'gacha',
			label: <GiCardRandom size={30} />,
			content: (
				<div className="flex flex-col gap-4">
					<div className="flex flex-col sm:flex-row justify-center gap-2 w-full items-center">
						<button
							type="button"
							className="btn btn-primary w-full sm:w-auto"
							onClick={handleOpenGachaPopup}
							disabled={!canPlayGacha}
						>
							{`ガチャを引く (${MAX_GACHA_PLAYS_PER_DAY - gachaPlayCountToday}回残)`}
						</button>
						<RatioPopup gkktt={gkktt} />
					</div>
					{gachaMessage && (
						<div className="text-error text-center text-sm">{gachaMessage}</div>
					)}
					<GachaLogs session={session} />
				</div>
			),
		},
		{
			id: 'band',
			label: <GiGuitarHead size={30} />,
			content: (
				<div className="flex flex-col items-center">
					<p className="text-sm text-center mt-2">
						バンド機能を追加予定！まだ出来てないよ～
					</p>
				</div>
			),
		},
	]

	return (
		<>
			<Tabs>
				{tabs.map((tab) => (
					<Tab key={tab.id} label={tab.label}>
						{tab.content}
					</Tab>
				))}
			</Tabs>
			<GachaMainPopup
				session={session}
				gachaPlayCountToday={gachaPlayCountToday}
				onGachaPlayedSuccessfully={() => {
					onGachaPlayedSuccessfully()
				}}
				open={isGachaPopupOpen}
				onClose={() => setIsGachaPopupOpen(false)}
				carouselPackData={gachaCarouselData}
			/>
		</>
	)
}

export default UserPageTabs
