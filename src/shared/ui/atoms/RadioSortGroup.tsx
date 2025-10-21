interface SortOption<T extends string> {
	value: T
	label: string
}

interface RadioSortGroupProps<T extends string> {
	name: string
	options: SortOption<T>[]
	currentSort: T
	onSortChange: (newSort: T) => void
	className?: string
	buttonClassName?: string
	size?: 'sm' | 'md' | 'lg'
}

const RadioSortGroup = <T extends string>({
	name,
	options,
	currentSort,
	onSortChange,
	className = '',
	buttonClassName = '',
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
