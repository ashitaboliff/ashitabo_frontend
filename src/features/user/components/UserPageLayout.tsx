'use client'

import { useState, ReactNode } from 'react'
import { useRouter } from 'next-nprogress-bar'
import { useSession } from 'next-auth/react'
import { signOutUser as signOutAction } from '@/features/user/actions'
import { Tabs, Tab } from '@/components/ui/atoms/Tabs'
import ProfileDisplay from './ProfileDisplay'
import { gkktt } from '@/lib/fonts'
import GachaMainPopup from '@/features/gacha/components/GachaMainPopup'
import { useGachaPlayManager } from '@/features/gacha/hooks/useGachaPlayManager'

import { GiCardRandom, GiGuitarHead } from 'react-icons/gi' // GiGuitarHead を追加
import { MdOutlineEditCalendar } from 'react-icons/md'
import RatioPopup from '@/features/gacha/components/RatioPopup'
import BandList from '@/features/band/components/BandList'

interface UserPageLayoutProps {
	session: Session
	children: ReactNode
}

const UserPageLayout = ({ session, children }: UserPageLayoutProps) => {
	const session2 = useSession()
	const router = useRouter()
	const [isGachaPopupOpen, setIsGachaPopupOpen] = useState(false)

	const {
		canPlayGacha,
		gachaPlayCountToday,
		gachaMessage,
		onGachaPlayedSuccessfully,
		MAX_GACHA_PLAYS_PER_DAY,
	} = useGachaPlayManager()

	const handleOpenGachaMainPopup = () => {
		if (canPlayGacha) {
			setIsGachaPopupOpen(true)
		} else {
			console.log(gachaMessage)
		}
	}

	const signOutUser = async () => {
		await signOutAction()
		await session2.update({ triggerUpdate: Date.now() })
		router.push('/home')
	}

	// children は bookingLogs と gachaLogs のタプルを期待している可能性がある
	// children の構造に合わせて調整が必要。ここでは bookingLogs, gachaLogs のみと仮定
	const [bookingLogs, gachaLogs, ...otherChildren] = Array.isArray(children)
		? children
		: [null, null]
	// もし children が固定で2つの要素しか持たないなら、上記は不要で元のままで良い。
	// BandList は children とは独立して配置する。

	return (
		<div className="container mx-auto p-4 flex flex-col items-center">
			<ProfileDisplay session={session} />
			<button
				className="btn btn-outline btn-primary w-full md:w-1/2 lg:w-1/3 mb-4"
				onClick={() => router.push('/user/edit')}
			>
				プロフィールを編集
			</button>
			{session.user.role === 'ADMIN' && (
				<button
					className="btn btn-secondary btn-outline w-full md:w-1/2 lg:w-1/3 mb-4"
					onClick={() => router.push('/admin')}
				>
					管理者ページへ
				</button>
			)}
			{session.user.role === 'TOPADMIN' && (
				<div className="flex flex-col md:flex-row justify-center gap-2 mb-4 w-full md:w-2/3 lg:w-1/2">
					<button
						className="btn btn-accent btn-outline w-full md:w-1/2"
						onClick={() => router.push('/admin')}
					>
						管理者ページ
					</button>
					<button
						className="btn btn-accent btn-outline w-full md:w-1/2"
						onClick={() => router.push('/admin/topadmin')}
					>
						トップ管理者ページ
					</button>
				</div>
			)}
			<div className="w-full">
				<Tabs>
					<Tab label={<MdOutlineEditCalendar size={30} />}>{bookingLogs}</Tab>
					<Tab label={<GiCardRandom size={30} />}>
						<div className="flex flex-col items-center mb-4 gap-y-2">
							<div className="flex flex-col sm:flex-row justify-center gap-2 w-full">
								<button
									className="btn btn-primary w-full sm:w-auto"
									onClick={handleOpenGachaMainPopup}
									disabled={!canPlayGacha}
								>
									ガチャを引く ({MAX_GACHA_PLAYS_PER_DAY - gachaPlayCountToday}
									回残)
								</button>
								<RatioPopup gkktt={gkktt} />
							</div>
							{gachaMessage && (
								<div className="text-error text-center mt-2">
									{gachaMessage}
								</div>
							)}
						</div>
						{gachaLogs}
					</Tab>
					<Tab label={<GiGuitarHead size={30} />}>
						{/* <BandList currentUserId={session.user.id} /> */}
						<div className="flex flex-col items-center">
							<p className="text-sm text-center mt-2">
								バンド機能を追加予定！まだ出来てないよ～
							</p>
						</div>
					</Tab>
				</Tabs>
			</div>
			<div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 w-full md:w-1/2 lg:w-1/3">
				<button
					className="btn btn-error btn-outline w-full sm:w-1/2"
					onClick={signOutUser}
				>
					ログアウト
				</button>
				<button className="btn btn-disabled w-full sm:w-1/2" disabled>
					アカウントを削除
				</button>
			</div>
			<GachaMainPopup
				session={session}
				gachaPlayCountToday={gachaPlayCountToday}
				onGachaPlayedSuccessfully={() => {
					onGachaPlayedSuccessfully()
				}}
				open={isGachaPopupOpen}
				onClose={() => setIsGachaPopupOpen(false)}
			/>
		</div>
	)
}

export default UserPageLayout
