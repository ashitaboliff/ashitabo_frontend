'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import type { CarouselPackDataItem } from '@/domains/gacha/model/gachaTypes'

interface Props {
	readonly onPackSelect: (version: string) => void
	readonly carouselPackData: CarouselPackDataItem[]
}

const GachaPackCarousel = ({ onPackSelect, carouselPackData }: Props) => {
	const packs = useMemo(
		() => carouselPackData.filter(Boolean),
		[carouselPackData],
	)
	const [currentIndex, setCurrentIndex] = useState<number>(() =>
		packs.length > 0 ? packs.length - 1 : 0,
	)

	useEffect(() => {
		setCurrentIndex((prev) => {
			if (packs.length === 0) {
				return 0
			}
			return Math.min(prev, packs.length - 1)
		})
	}, [packs.length])

	const updateIndex = (direction: 'next' | 'prev') => {
		if (packs.length === 0) return

		if (direction === 'next' && currentIndex < packs.length - 1) {
			setCurrentIndex((prev) => prev + 1)
		} else if (direction === 'prev' && currentIndex > 0) {
			setCurrentIndex((prev) => prev - 1)
		}
	}

	const handlePackClick = () => {
		if (packs.length === 0 || !packs[currentIndex]) return
		const selectedVersion = packs[currentIndex].version
		if (onPackSelect) {
			onPackSelect(selectedVersion)
		}
	}

	if (packs.length === 0) {
		return (
			<div className="relative flex h-[600px] w-full select-none items-center justify-center overflow-hidden">
				<p>利用可能なガチャパックがありません。</p>
			</div>
		)
	}

	const currentPack = packs[currentIndex]
	const prevPack = currentIndex > 0 ? packs[currentIndex - 1] : null
	const nextPack =
		currentIndex < packs.length - 1 ? packs[currentIndex + 1] : null

	return (
		<div className="relative flex h-[600px] w-full select-none items-center justify-center overflow-hidden">
			<button
				type="button"
				className="btn btn-soft btn-secondary absolute left-0 z-30 font-black text-xl"
				onClick={() => updateIndex('prev')}
				disabled={currentIndex === 0 || packs.length === 0}
			>
				{'<'}
			</button>

			{currentPack ? (
				<div className="relative flex w-full items-center justify-center">
					{prevPack?.signedPackImageUrl ? (
						<button
							type="button"
							className="absolute left-0 z-10 transform cursor-pointer transition-transform"
							onClick={() => updateIndex('prev')}
						>
							<Image
								src={prevPack.signedPackImageUrl}
								alt={`${prevPack.version} pack`}
								width={110}
								height={200}
								decoding="async"
								loading="lazy"
							/>
						</button>
					) : (
						<div className="absolute left-0 z-10 flex h-[200px] w-[110px] items-center justify-center">
							{prevPack && <div className="text-xs">画像なし</div>}
						</div>
					)}

					{currentPack.signedPackImageUrl ? (
						<div className="relative z-20 transform cursor-pointer transition-transform">
							<Image
								src={currentPack.signedPackImageUrl}
								alt={`${currentPack.version} pack`}
								width={250}
								height={400}
								onClick={handlePackClick}
								decoding="async"
								priority={true}
							/>
							<button
								type="button"
								className="pack-text -translate-y-80 absolute left-0 z-30 w-full bg-base-content/50 py-1 text-center font-bold text-2xl text-white"
								onClick={handlePackClick}
							>
								このパックを引く
							</button>
						</div>
					) : (
						<div className="relative z-20 flex h-[400px] w-[250px] flex-col items-center justify-center rounded-lg bg-base-200">
							<p className="text-error-content text-sm">画像表示エラー</p>
							<p className="mt-1 text-error-content/70 text-xs">
								{currentPack.version}
							</p>
						</div>
					)}

					{nextPack?.signedPackImageUrl ? (
						<button
							type="button"
							className="absolute right-0 z-10 transform cursor-pointer transition-transform"
							onClick={() => updateIndex('next')}
						>
							<Image
								src={nextPack.signedPackImageUrl}
								alt={`${nextPack.version} pack`}
								width={110}
								height={200}
								decoding="async"
								loading="lazy"
							/>
						</button>
					) : (
						<div className="absolute right-0 z-10 flex h-[200px] w-[110px] items-center justify-center">
							{nextPack && <div className="text-xs">画像なし</div>}
						</div>
					)}
				</div>
			) : (
				<div className="flex h-[25rem] flex-col items-center justify-center">
					<div className="loading loading-spinner loading-lg my-auto"></div>
				</div>
			)}

			<button
				type="button"
				className="btn btn-soft btn-secondary absolute right-0 z-30 font-black text-xl"
				onClick={() => updateIndex('next')}
				disabled={currentIndex === packs.length - 1 || packs.length === 0}
			>
				{'>'}
			</button>
		</div>
	)
}

export default GachaPackCarousel
