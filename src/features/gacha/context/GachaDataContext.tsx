'use client'

import { createContext, type ReactNode, useContext } from 'react'

export interface CarouselPackDataItem {
	version: string
	r2Key: string
	signedPackImageUrl: string
}

interface GachaDataContextType {
	gachaCarouselData: CarouselPackDataItem[]
}

const GachaDataContext = createContext<GachaDataContextType | undefined>(
	undefined,
)

export const GachaDataProvider = ({
	children,
	gachaCarouselData,
}: {
	children: ReactNode
	gachaCarouselData: CarouselPackDataItem[]
}) => {
	return (
		<GachaDataContext value={{ gachaCarouselData }}>
			{children}
		</GachaDataContext>
	)
}

export const useGachaData = () => {
	const context = useContext(GachaDataContext)
	if (context === undefined) {
		throw new Error('useGachaData must be used within a GachaDataProvider')
	}
	return context
}
