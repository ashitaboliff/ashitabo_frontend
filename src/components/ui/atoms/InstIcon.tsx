'use client'

import { Part, PartMap } from '@/features/user/types'

import { MdPiano as PianoIcon } from 'react-icons/md'
import { GiGuitarBassHead as BassIcon } from 'react-icons/gi'
import { GiGuitarHead as GuitarIcon } from 'react-icons/gi'
import { FaDrum as DrumIcon } from 'react-icons/fa'
import { IoMdMicrophone as MicIcon } from 'react-icons/io'
import { IoEllipsisHorizontalCircleSharp as OtherIcon } from 'react-icons/io5'

const InstIcon = ({ part, size }: { part: Part[]; size?: number }) => {
	const iconSize = size || 20

	const icons = {
		VOCAL: <MicIcon size={iconSize} color="#000000" />,
		BACKING_GUITAR: <GuitarIcon size={iconSize} color="#FF6F61" />,
		LEAD_GUITAR: <GuitarIcon size={iconSize} color="#B22222" />,
		BASS: <BassIcon size={iconSize} color="#4169E1" />,
		DRUMS: <DrumIcon size={iconSize} color="#FFC107" />,
		KEYBOARD: <PianoIcon size={iconSize} color="#2A9D8F" />,
		OTHER: <OtherIcon size={iconSize} color="#6C757D" />,
	}

	const sortedParts = Object.keys(icons).filter((key) =>
		part.includes(key as Part),
	)

	return (
		<div className="flex flex-wrap justify-around">
			<div
				className={`grid md:flex md:flex-row gap-1 w-full ${size! < 20 ? 'grid-cols-8' : 'grid-cols-4'}`}
			>
				{sortedParts.map((p) => (
					<div key={p} className="tooltip" data-tip={PartMap[p as Part]}>
						<div
							className={`btn btn-ghost no-animation btn-circle ${size! < 20 ? `btn-xs` : 'btn-sm'}`}
						>
							{icons[p as Part]}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default InstIcon
