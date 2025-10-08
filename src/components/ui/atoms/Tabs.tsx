import React, {
	useEffect,
	useMemo,
	useState,
	isValidElement,
	Children,
	type ReactNode,
	type ReactElement,
} from 'react'

interface TabProps {
	label: ReactNode
	children: ReactNode
}

interface TabsProps {
	children: ReactNode
}

export const Tabs = ({ children }: TabsProps) => {
	const tabChildren = useMemo(
		() =>
			Children.toArray(children).filter(
				(child): child is ReactElement<TabProps> =>
					isValidElement<TabProps>(child),
			),
		[children],
	)

	const [activeIndex, setActiveIndex] = useState(0)

	useEffect(() => {
		if (activeIndex >= tabChildren.length) {
			setActiveIndex(tabChildren.length > 0 ? tabChildren.length - 1 : 0)
		}
	}, [activeIndex, tabChildren.length])

	if (tabChildren.length === 0) {
		return null
	}

	const handleTabClick = (index: number) => {
		setActiveIndex(index)
	}

	const activeChild = tabChildren[activeIndex] ?? null

	return (
		<div className="mt-2">
			<div className="flex justify-center space-x-4 border-b border-neutral-200">
				{tabChildren.map((child, index) => {
					const isActive = index === activeIndex
					return (
						<button
							key={child.key ?? index}
							className={`py-2 px-4 text-lg ${
								isActive
									? 'border-b-2 text-accent'
									: 'text-base-content hover:text-accent'
							}`}
							onClick={() => handleTabClick(index)}
						>
							{child.props.label}
						</button>
					)
				})}
			</div>
			<div className="p-4">{activeChild}</div>
		</div>
	)
}

export const Tab = ({ children }: TabProps) => {
	return <>{children}</>
}
