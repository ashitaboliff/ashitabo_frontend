'use client'

import { createContext, useContext, ReactNode } from 'react'

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
		<GachaDataContext.Provider value={{ gachaCarouselData }}>
			{children}
		</GachaDataContext.Provider>
	)
}

export const useGachaData = () => {
	const context = useContext(GachaDataContext)
	if (context === undefined) {
		throw new Error('useGachaData must be used within a GachaDataProvider')
	}
	return context
}
