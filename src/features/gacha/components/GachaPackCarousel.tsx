'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { CarouselPackDataItem } from '@/features/gacha/context/GachaDataContext'

interface Props {
	onPackSelect: (version: string) => void
	carouselPackData: CarouselPackDataItem[]
}

const GachaPackCarousel = ({ onPackSelect, carouselPackData }: Props) => {
	const [packs, setPacks] = useState<CarouselPackDataItem[]>(
		carouselPackData || [],
	)
	const [currentIndex, setCurrentIndex] = useState<number>(
		(carouselPackData?.length || 0) > 0 ? carouselPackData.length - 1 : 0,
	)
	const [packViewed, setPackViewed] = useState<boolean>(false)

	useEffect(() => {
		setPacks(carouselPackData || [])
		setCurrentIndex(
			(carouselPackData?.length || 0) > 0
				? Math.min(currentIndex, carouselPackData.length - 1)
				: 0,
		)
	}, [carouselPackData, currentIndex])

	useEffect(() => {
		if (packs && packs.length > 0) {
			setPackViewed(false)
			const timer = setTimeout(() => {
				setPackViewed(true)
			}, 50)
			return () => clearTimeout(timer)
		} else {
			setPackViewed(false)
		}
	}, [packs])

	const updateIndex = (direction: 'next' | 'prev') => {
		if (!packs || packs.length === 0) return

		if (direction === 'next' && currentIndex < packs.length - 1) {
			setCurrentIndex((prev) => prev + 1)
		} else if (direction === 'prev' && currentIndex > 0) {
			setCurrentIndex((prev) => prev - 1)
		}
	}

	const handlePackClick = () => {
		if (!packs || packs.length === 0 || !packs[currentIndex]) return
		const selectedVersion = packs[currentIndex].version
		if (onPackSelect) {
			onPackSelect(selectedVersion)
		}
	}

	if (!carouselPackData) {
		return (
			<div className="relative flex items-center justify-center w-full h-[600px] overflow-hidden select-none">
				<div className="loading loading-spinner loading-lg my-auto"></div>
				<p className="mt-2">ガチャパック情報を読み込み中...</p>
			</div>
		)
	}

	if (packs.length === 0) {
		return (
			<div className="relative flex items-center justify-center w-full h-[600px] overflow-hidden select-none">
				<p>利用可能なガチャパックがありません。</p>
			</div>
		)
	}

	const currentPack = packs[currentIndex]
	const prevPack = currentIndex > 0 ? packs[currentIndex - 1] : null
	const nextPack =
		currentIndex < packs.length - 1 ? packs[currentIndex + 1] : null

	return (
		<div className="relative flex items-center justify-center w-full h-[600px] overflow-hidden select-none">
			<button
				type="button"
				className="absolute left-0 z-30 btn btn-soft btn-secondary font-black text-xl"
				onClick={() => updateIndex('prev')}
				disabled={currentIndex === 0 || packs.length === 0}
			>
				{'<'}
			</button>

			{packViewed && currentPack ? (
				<div className="relative flex items-center justify-center w-full">
					{prevPack?.signedPackImageUrl ? (
						<button
							type="button"
							className="absolute left-0 z-10 transform transition-transform cursor-pointer"
							onClick={() => updateIndex('prev')}
						>
							<Image
								src={prevPack.signedPackImageUrl}
								alt={`${prevPack.version} pack`}
								width={110}
								height={200}
								decoding="auto"
								priority={false}
							/>
						</button>
					) : (
						<div className="absolute left-0 w-[110px] h-[200px] z-10 flex items-center justify-center">
							{prevPack && <div className="text-xs">画像なし</div>}
						</div>
					)}

					{currentPack.signedPackImageUrl ? (
						<div className="relative z-20 transform transition-transform cursor-pointer">
							<Image
								src={currentPack.signedPackImageUrl}
								alt={`${currentPack.version} pack`}
								width={250}
								height={400}
								onClick={handlePackClick}
								decoding="auto"
								priority={true}
							/>
							<button
								type="button"
								className="pack-text absolute left-0 w-full text-2xl font-bold bg-base-content/50 text-white text-center py-1 -translate-y-80 z-30"
								onClick={handlePackClick}
							>
								このパックを引く
							</button>
						</div>
					) : (
						<div className="relative z-20 flex flex-col items-center justify-center w-[250px] h-[400px] bg-base-200 rounded-lg">
							<p className="text-error-content text-sm">画像表示エラー</p>
							<p className="text-xs text-error-content/70 mt-1">
								{currentPack.version}
							</p>
						</div>
					)}

					{nextPack?.signedPackImageUrl ? (
						<button
							type="button"
							className="absolute right-0 z-10 transform transition-transform cursor-pointer"
							onClick={() => updateIndex('next')}
						>
							<Image
								src={nextPack.signedPackImageUrl}
								alt={`${nextPack.version} pack`}
								width={110}
								height={200}
								decoding="auto"
								priority={false}
							/>
						</button>
					) : (
						<div className="absolute right-0 w-[110px] h-[200px] z-10 flex items-center justify-center">
							{nextPack && <div className="text-xs">画像なし</div>}
						</div>
					)}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center h-[25rem]">
					<div className="loading loading-spinner loading-lg my-auto"></div>
				</div>
			)}

			<button
				type="button"
				className="absolute right-0 z-30 btn btn-soft btn-secondary font-black text-xl"
				onClick={() => updateIndex('next')}
				disabled={currentIndex === packs.length - 1 || packs.length === 0}
			>
				{'>'}
			</button>
		</div>
	)
}

export default GachaPackCarousel
