const pad = (value: number) => value.toString().padStart(2, '0')

const toDate = (value: Date | string | number) =>
	value instanceof Date ? value : new Date(value)

export const formatDateJa = (value: Date | string | number) => {
	const date = toDate(value)
	if (Number.isNaN(date.getTime())) {
		return ''
	}
	const year = date.getFullYear()
	const month = pad(date.getMonth() + 1)
	const day = pad(date.getDate())
	return `${year}年${month}月${day}日`
}

export const formatDateTimeJa = (value: Date | string | number) => {
	const date = toDate(value)
	if (Number.isNaN(date.getTime())) {
		return ''
	}
	const year = date.getFullYear()
	const month = pad(date.getMonth() + 1)
	const day = pad(date.getDate())
	const hours = pad(date.getHours())
	const minutes = pad(date.getMinutes())
	const seconds = pad(date.getSeconds())
	return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`
}
