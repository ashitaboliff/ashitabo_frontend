import { useCallback, useEffect, useRef, useState } from 'react'

export const createSyntheticEvent = <TValue extends string | number>(
	name: string,
	value: TValue | TValue[],
) =>
	({
		target: { name, value },
	}) as React.ChangeEvent<HTMLSelectElement> & {
		target: { name: string; value: TValue | TValue[] }
	}

export const useDropdown = () => {
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const close = useCallback(() => setIsOpen(false), [])
	const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				close()
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		} else {
			document.removeEventListener('mousedown', handleClickOutside)
		}

		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [isOpen, close])

	return { isOpen, toggle, close, dropdownRef }
}
