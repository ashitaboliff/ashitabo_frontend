import HomeButton from '@/app/home/_components/HomeButton'
import Carousel from '@/app/home/_components/HomeCarousel'

const Page = () => {
	return (
		<div>
			<Carousel />
			<div className="z-10 flex flex-col items-center justify-center bg-white/60">
				<div className={`whitespace-nowrap text-2xl`}>
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
