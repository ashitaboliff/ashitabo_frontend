import {
	Children,
	isValidElement,
	type ReactElement,
	type ReactNode,
	useEffect,
	useMemo,
	useState,
} from 'react'

interface TabProps {
	label: ReactNode
	children: ReactNode
	value?: string
}

interface TabsProps {
	children: ReactNode
	value?: string
	onChange?: (value: string) => void
	className?: string
	tabListClassName?: string
	contentClassName?: string
}

export const Tabs = ({
	children,
	value,
	onChange,
	className = 'mt-2',
	tabListClassName = 'flex justify-center space-x-4 border-b border-neutral-200',
	contentClassName = 'p-4',
}: TabsProps) => {
	const tabChildren = useMemo(
		() =>
			Children.toArray(children).filter(
				(child): child is ReactElement<TabProps> =>
					isValidElement<TabProps>(child),
			),
		[children],
	)

	const tabValues = useMemo(() => {
		return tabChildren.map(
			(child, index) => child.props.value ?? `tab-${index}`,
		)
	}, [tabChildren])

	const [internalValue, setInternalValue] = useState<string>(() => {
		return value ?? tabValues[0] ?? 'tab-0'
	})
	const isControlled = value !== undefined

	useEffect(() => {
		if (!value) {
			return
		}
		setInternalValue(value)
	}, [value])

	useEffect(() => {
		setInternalValue((prev) => {
			if (tabValues.includes(prev)) {
				return prev
			}
			return tabValues[0] ?? prev
		})
	}, [tabValues])

	if (tabChildren.length === 0) {
		return null
	}

	const activeValue = value ?? internalValue

	const handleTabClick = (nextValue: string) => {
		if (!isControlled) {
			setInternalValue(nextValue)
		}
		onChange?.(nextValue)
	}

	return (
		<div className={className}>
			<div className={tabListClassName}>
				{tabChildren.map((child, index) => {
					const tabValue = tabValues[index]
					const isActive = tabValue === activeValue
					return (
						<button
							type="button"
							key={`${child.key ?? 'tab'}-${tabValue}`}
							className={`px-4 py-2 text-lg ${
								isActive
									? 'border-b-2 text-accent'
									: 'text-base-content hover:text-accent'
							}`}
							onClick={() => handleTabClick(tabValue)}
						>
							{child.props.label}
						</button>
					)
				})}
			</div>
			<div className={contentClassName}>
				{tabChildren.map((child, index) => {
					const tabValue = tabValues[index]
					const isActive = tabValue === activeValue
					return (
						<div
							key={`panel-${child.key ?? 'tab'}-${tabValue}`}
							role="tabpanel"
							aria-hidden={!isActive}
							className={isActive ? 'block' : 'hidden'}
						>
							{child}
						</div>
					)
				})}
			</div>
		</div>
	)
}

export const Tab = ({ children }: TabProps) => {
	return <>{children}</>
}
