import HomeButton from '@/app/home/_components/HomeButton'
import Carousel from '@/app/home/_components/HomeCarousel'

const Page = () => {
	return (
		<div>
			<Carousel />
			<div className="flex flex-col items-center justify-center bg-white/60 z-10">
				<div className={`text-2xl whitespace-nowrap`}>
					信大＆県大のB1～M2が所属する
				</div>
				<div className={`text-2xl`}>軽音サークル♪</div>
				<div className={`text-2xl`}>長野市で活動しています！</div>
			</div>
			<HomeButton />
		</div>
	)
}

export default Page
