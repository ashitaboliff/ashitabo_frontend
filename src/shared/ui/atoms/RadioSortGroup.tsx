interface SortOption<T extends string> {
	readonly value: T
	readonly label: string
}

interface RadioSortGroupProps<T extends string> {
	readonly name: string
	readonly options: SortOption<T>[]
	readonly currentSort: T
	readonly onSortChange: (newSort: T) => void
	readonly className?: string
	readonly buttonClassName?: string
	readonly size?: 'xs' | 'sm' | 'md' | 'lg'
}

const RadioSortGroup = <T extends string>({
	name,
	options,
	currentSort,
	onSortChange,
	className = '',
	buttonClassName = 'btn-outline checked:btn-accent',
	size = 'sm',
}: RadioSortGroupProps<T>) => {
	return (
		<div className={`join ${className}`}>
			{options.map((option) => (
				<input
					key={option.value}
					className={`join-item btn btn-${size} ${buttonClassName}`}
					type="radio"
					name={name}
					aria-label={option.label}
					value={option.value}
					checked={currentSort === option.value}
					onChange={() => onSortChange(option.value)}
				/>
			))}
		</div>
	)
}

export default RadioSortGroup
