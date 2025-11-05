'use server'

import { gkktt } from '@/shared/lib/fonts'
import HomePageBar from '@/shared/ui/atoms/HomePageBar'

const HomePageHeader = () => {
	return (
		<div
			className={`relative mb-8 flex flex-col items-center ${gkktt.className}`}
		>
			<div className={`absolute flex w-full justify-center`}>
				<HomePageBar />
			</div>
			<div className="z-10 mt-4 flex flex-col items-center justify-center bg-white/60">
				<h2 className={`whitespace-nowrap text-xl`}>
					信州大学工学部・教育学部・長野県立大学
				</h2>
				<h2 className={`text-xl`}>軽音サークル</h2>
				<h1 className={`text-7xl`}>あしたぼ</h1>
			</div>
		</div>
	)
}

export default HomePageHeader
