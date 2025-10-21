export interface PadLock {
	id: string
	name: string
	createdAt: Date
	updatedAt: Date
	isDeleted: boolean
}

export type BanBookingSort = 'new' | 'old' | 'relativeCurrent'
