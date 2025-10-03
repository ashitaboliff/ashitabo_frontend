import type {
	Band as PrismaBand,
	BandMember as PrismaBandMember,
	User as PrismaUser,
	Profile as PrismaProfile,
	Part,
} from '@prisma/client'
import type { ApiResponse } from '@/types/responseTypes'
import type { BandDetails, BandMemberDetails } from './repository'

export type { Part }

// Re-exporting the detailed types from the repository
export type { BandDetails, BandMemberDetails }

// This type is still useful for user-related operations, like search
export interface UserWithProfile extends PrismaUser {
	profile: PrismaProfile | null
}

// The following interfaces are now covered by BandDetails and BandMemberDetails
// export interface BandMemberWithUser extends PrismaBandMember {
// 	user: UserWithProfile
// }
//
// export interface BandWithMembersAndUsers extends PrismaBand {
// 	members: BandMemberWithUser[]
// }

// Form data types
export interface BandFormData {
	name: string
}

export interface BandMemberFormData {
	userId: string
	part: Part
}

// API response types using the new inferred types
export type CreateBandResponse = ApiResponse<BandDetails>
export type UpdateBandResponse = ApiResponse<BandDetails>
export type DeleteBandResponse = ApiResponse<null>
export type AddBandMemberResponse = ApiResponse<BandMemberDetails>
export type UpdateBandMemberResponse = ApiResponse<BandMemberDetails>
export type RemoveBandMemberResponse = ApiResponse<null>
