import Link from 'next/link'
import {
	FaRegUserCircle,
	IoHomeOutline,
	LuMenu,
	MdOutlineEditCalendar,
	RxCountdownTimer,
} from '@/shared/ui/icons'
import HeaderIcon from './HeaderIcon'

const Layout = async ({ className }: { className?: string }) => {
	const drawerId = 'main-menu-drawer'

	return (
		<header className="drawer">
			<input id={drawerId} type="checkbox" className="drawer-toggle" />
			<div className="drawer-content flex flex-col">
				<div
					className={`navbar mb-5 border-base-300 border-b-2 bg-white ${
						className || ''
					}`}
				>
					<div className="navbar-start md:pl-5">
						<label
							htmlFor={drawerId}
							className="btn btn-square btn-ghost drawer-button"
						>
							<LuMenu className="text-3xl" />
						</label>
					</div>
					<div className="navbar-center">
						<Link href="/home">
							<p className="text-center text-3xl">あしたぼホームページ</p>
						</Link>
					</div>
					<div className="navbar-end md:pr-5">
						<HeaderIcon />
					</div>
				</div>
			</div>
			<div className="drawer-side z-50">
				<label
					htmlFor={drawerId}
					aria-label="close sidebar"
					className="drawer-overlay"
				></label>
				<ul className="menu min-h-full w-64 border-base-100 border-r-2 bg-base-100 p-4 text-base-content">
					<li className="text-lg">
						<Link href="/home">
							<IoHomeOutline />
							ホーム
						</Link>
					</li>
					<li className="text-lg">
						<Link href="/booking">
							<MdOutlineEditCalendar /> コマ表
						</Link>
					</li>
					<li className="text-lg">
						<Link href="/booking/logs">
							<RxCountdownTimer /> 予約ログ
						</Link>
					</li>
					<li className="text-lg">
						<Link href="/auth/signin">
							<FaRegUserCircle /> 利用登録
						</Link>
					</li>
				</ul>
			</div>
		</header>
	)
}

export default Layout
