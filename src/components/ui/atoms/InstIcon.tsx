import {
	GiGuitarBassHead as BassIcon,
	FaDrum as DrumIcon,
	GiGuitarHead as GuitarIcon,
	IoMdMicrophone as MicIcon,
	IoEllipsisHorizontalCircleSharp as OtherIcon,
	MdPiano as PianoIcon,
} from '@/components/ui/icons'
import { type Part, PartMap } from '@/features/user/types'

const InstIcon = ({ part, size }: { part: Part[]; size?: number }) => {
	const iconSize = size ?? 20

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

	const gridColumnsClass = iconSize < 20 ? 'grid-cols-8' : 'grid-cols-4'
	const buttonSizeClass = iconSize < 20 ? 'btn-xs' : 'btn-sm'

	return (
		<div className="flex flex-wrap justify-around">
			<div
				className={`grid md:flex md:flex-row gap-1 w-full ${gridColumnsClass}`}
			>
				{sortedParts.map((p) => (
					<div key={p} className="tooltip" data-tip={PartMap[p as Part]}>
						<div
							className={`btn btn-ghost no-animation btn-circle ${buttonSizeClass}`}
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
