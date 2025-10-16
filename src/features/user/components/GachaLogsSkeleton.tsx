'use client'

import { useMemo } from 'react'

interface LogsSkeletonProps {
	logsPerPage: number
}

const LogsSkeleton = ({ logsPerPage }: LogsSkeletonProps) => {
	const skeletonIds = useMemo(
		() =>
			Array.from(
				{ length: logsPerPage },
				(_, index) => `skeleton-${logsPerPage}-${index}`,
			),
		[logsPerPage],
	)
	return (
		<div
			className={`grid ${logsPerPage % 3 === 0 ? 'grid-cols-3' : 'grid-cols-5'} gap-2`}
		>
			{skeletonIds.map((id) => (
				<div key={id} className="skeleton w-full aspect-gacha" />
			))}
		</div>
	)
}

export default LogsSkeleton
