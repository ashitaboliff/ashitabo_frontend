'use client'

import { useState, type ReactNode } from 'react'
import { Tabs, Tab } from '@/components/ui/atoms/Tabs'
import BookingLogs from '@/features/user/components/BookingLogs'
import GachaLogs from '@/features/user/components/GachaLogs'
import { GiCardRandom, GiGuitarHead } from 'react-icons/gi'
import { MdOutlineEditCalendar } from 'react-icons/md'
import RatioPopup from '@/features/gacha/components/RatioPopup'
import { gkktt } from '@/lib/fonts'
import { useGachaPlayManager } from '@/features/gacha/hooks/useGachaPlayManager'
import GachaMainPopup from '@/features/gacha/components/GachaMainPopup'
import type { Session } from '@/types/session'

interface UserPageTabsProps {
	session: Session
}

const UserPageTabs = ({ session }: UserPageTabsProps) => {
	const [isGachaPopupOpen, setIsGachaPopupOpen] = useState(false)

	const {
		canPlayGacha,
		gachaPlayCountToday,
		gachaMessage,
		onGachaPlayedSuccessfully,
		MAX_GACHA_PLAYS_PER_DAY,
	} = useGachaPlayManager()

	const handleOpenGachaPopup = () => {
		if (canPlayGacha) {
			setIsGachaPopupOpen(true)
		}
	}

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
							className="btn btn-primary w-full sm:w-auto"
							onClick={handleOpenGachaPopup}
							disabled={!canPlayGacha}
						>
							ガチャを引く ({MAX_GACHA_PLAYS_PER_DAY - gachaPlayCountToday}回残)
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
					setIsGachaPopupOpen(false)
				}}
				open={isGachaPopupOpen}
				onClose={() => setIsGachaPopupOpen(false)}
			/>
		</>
	)
}

export default UserPageTabs
