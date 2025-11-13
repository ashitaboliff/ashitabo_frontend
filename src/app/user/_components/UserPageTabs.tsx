'use client'

import dynamic from 'next/dynamic'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react'
import BookingLogs from '@/app/user/_components/tabs/booking'
import GachaLogs from '@/app/user/_components/tabs/gacha'
import ProfileDetailsTab from '@/app/user/_components/tabs/profile/ProfileDetailsTab'
import { useGachaPlayManager } from '@/domains/gacha/hooks/useGachaPlayManager'
import type { CarouselPackDataItem } from '@/domains/gacha/model/gachaTypes'
import type { AccountRole, Profile } from '@/domains/user/model/userTypes'
import { gkktt } from '@/shared/lib/fonts'
import { Tab, Tabs } from '@/shared/ui/atoms/Tabs'
import {
	GiCardRandom,
	GiGuitarHead,
	LuUserRound,
	MdOutlineEditCalendar,
} from '@/shared/ui/icons'
import type { Session } from '@/types/session'

const GachaController = dynamic(
	() => import('@/domains/gacha/ui/GachaController'),
	{
		ssr: false,
		loading: () => null,
	},
) as typeof import('@/domains/gacha/ui/GachaController')['default']

const RatioPopup = dynamic(() => import('@/domains/gacha/ui/RatioPopup'), {
	ssr: false,
	loading: () => (
		<button type="button" className="btn btn-outline w-full sm:w-auto">
			提供割合
		</button>
	),
}) as typeof import('@/domains/gacha/ui/RatioPopup')['default']

const TAB_ORDER = ['profile', 'booking', 'gacha', 'band'] as const

type TabId = (typeof TAB_ORDER)[number]

const normalizeTab = (tab?: string | null): TabId => {
	if (!tab) return 'profile'
	const lower = tab.toLowerCase()
	return (TAB_ORDER.find((item) => item === lower) ?? 'profile') as TabId
}

interface Props {
	readonly session: Session
	readonly gachaCarouselData: CarouselPackDataItem[]
	readonly profile: Profile | null
	readonly userInfo?: {
		name?: string | null
		role?: AccountRole | null
	}
	readonly initialTab?: string
}

const UserPageTabs = ({
	session,
	gachaCarouselData,
	profile,
	userInfo,
	initialTab,
}: Props) => {
	const [isGachaPopupOpen, setIsGachaPopupOpen] = useState(false)
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const [activeTab, setActiveTab] = useState<TabId>(() =>
		normalizeTab(initialTab),
	)

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

	useEffect(() => {
		const queryTab = searchParams?.get('tab')
		setActiveTab(normalizeTab(queryTab))
	}, [searchParams])

	const handleTabChange = useCallback(
		(nextTabId: string) => {
			const normalized = normalizeTab(nextTabId)
			const params = new URLSearchParams(searchParams?.toString())
			if (normalized === 'profile') {
				params.delete('tab')
			} else {
				params.set('tab', normalized)
			}
			const queryString = params.toString()
			const target = queryString ? `${pathname}?${queryString}` : pathname
			router.replace(target, { scroll: false })
			setActiveTab(normalized)
		},
		[pathname, router, searchParams],
	)

	const tabs: { id: TabId; label: ReactNode; content: ReactNode }[] = useMemo(
		() => [
			{
				id: 'profile',
				label: (
					<div className="flex items-center gap-2 text-sm">
						<LuUserRound size={24} />
					</div>
				),
				content: <ProfileDetailsTab profile={profile} userInfo={userInfo} />,
			},
			{
				id: 'booking',
				label: (
					<div className="flex items-center gap-2 text-sm">
						<MdOutlineEditCalendar size={24} />
					</div>
				),
				content: <BookingLogs session={session} />,
			},
			{
				id: 'gacha',
				label: (
					<div className="flex items-center gap-2 text-sm">
						<GiCardRandom size={24} />
					</div>
				),
				content: (
					<div className="flex flex-col gap-4">
						<div className="flex w-full flex-col items-center justify-center gap-2 sm:flex-row">
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
							<div className="text-center text-error text-sm">
								{gachaMessage}
							</div>
						)}
						<GachaLogs session={session} />
					</div>
				),
			},
			{
				id: 'band',
				label: (
					<div className="flex items-center gap-2 text-sm">
						<GiGuitarHead size={24} />
					</div>
				),
				content: (
					<div className="flex flex-col items-center">
						<p className="mt-2 text-center text-sm">
							バンド機能を追加予定！まだ出来てないよ～
						</p>
					</div>
				),
			},
		],
		[
			profile,
			session,
			canPlayGacha,
			MAX_GACHA_PLAYS_PER_DAY,
			gachaPlayCountToday,
			gachaMessage,
			handleOpenGachaPopup,
			userInfo,
		],
	)

	return (
		<>
			<Tabs value={activeTab} onChange={handleTabChange}>
				{tabs.map((tab) => (
					<Tab key={tab.id} label={tab.label} value={tab.id}>
						{tab.content}
					</Tab>
				))}
			</Tabs>
			<GachaController
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
