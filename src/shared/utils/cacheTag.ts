export function recordJoinSorted<T extends Record<string, any>>(
	obj: T,
): string {
	return (Object.keys(obj) as Array<keyof T>)
		.sort()
		.map((key) => obj[key])
		.join('-')
}
