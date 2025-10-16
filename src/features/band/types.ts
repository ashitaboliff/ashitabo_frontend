import type { Part } from '@/features/user/types'
import type { ApiResponse } from '@/types/responseTypes'

export type { Part }

export interface BandMemberUserSummary {
	id: string
	name: string | null
	image: string | null
	userId?: string | null
	profile?: {
		name?: string | null
		part?: Part[] | null
		studentId?: string | null
		expected?: string | null
		role?: string | null
	} | null
}

export interface BandMemberDetails {
	id: string
	bandId: string
	userId: string
	part: Part
	createdAt: Date
	updatedAt: Date
	user: BandMemberUserSummary
}

export interface BandDetails {
	id: string
	name: string
	description?: string | null
	createdAt: Date
	updatedAt: Date
	isDeleted?: boolean
	members: BandMemberDetails[]
}

export interface UserWithProfile {
	id: string
	name: string | null
	image: string | null
	userId?: string | null
	profile?: {
		name?: string | null
		part?: Part[] | null
		studentId?: string | null
		expected?: string | null
		role?: string | null
	} | null
}

export interface BandFormData {
	name: string
}

export interface BandMemberFormData {
	userId: string
	part: Part
}

export type CreateBandResponse = ApiResponse<BandDetails>
export type UpdateBandResponse = ApiResponse<BandDetails>
export type DeleteBandResponse = ApiResponse<null>
export type AddBandMemberResponse = ApiResponse<null>
export type UpdateBandMemberResponse = ApiResponse<null>
export type RemoveBandMemberResponse = ApiResponse<null>
