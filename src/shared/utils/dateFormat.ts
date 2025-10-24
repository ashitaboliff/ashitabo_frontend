const pad = (value: number) => value.toString().padStart(2, '0')

const WEEKDAY_JA = ['日', '月', '火', '水', '木', '金', '土'] as const

type DateInput = Date | string | number

export const toDate = (value: DateInput) => {
	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? null : new Date(value.getTime())
	}
	const date = new Date(value)
	return Number.isNaN(date.getTime()) ? null : date
}

const getParts = (date: Date) => {
	const hours = date.getHours()
	return {
		year: date.getFullYear().toString(),
		month: pad(date.getMonth() + 1),
		day: pad(date.getDate()),
		hours24: pad(hours),
		hours12: pad(((hours + 11) % 12) + 1),
		minutes: pad(date.getMinutes()),
		seconds: pad(date.getSeconds()),
		weekday: WEEKDAY_JA[date.getDay()],
	}
}

export const formatDateJa = (value: DateInput) => {
	const date = toDate(value)
	if (!date) return ''
	const { year, month, day } = getParts(date)
	return `${year}年${month}月${day}日`
}

export const formatDateJaWithWeekday = (
	value: DateInput,
	options?: { space?: boolean },
) => {
	const date = toDate(value)
	if (!date) return ''
	const { year, month, day, weekday } = getParts(date)
	const space = options?.space ?? false
	return `${year}年${month}月${day}日${space ? ' ' : ''}(${weekday})`
}

export const formatDateSlash = (value: DateInput) => {
	const date = toDate(value)
	if (!date) return ''
	const { year, month, day } = getParts(date)
	return `${year}/${month}/${day}`
}

export const formatDateSlashWithWeekday = (
	value: DateInput,
	options?: { space?: boolean },
) => {
	const date = toDate(value)
	if (!date) return ''
	const { year, month, day, weekday } = getParts(date)
	const space = options?.space ?? true
	return `${year}/${month}/${day}${space ? ' ' : ''}(${weekday})`
}

export const formatDateTimeJa = (
	value: DateInput,
	options?: { includeSeconds?: boolean },
) => {
	const date = toDate(value)
	if (!date) return ''
	const { year, month, day, hours24, minutes, seconds } = getParts(date)
	const includeSeconds = options?.includeSeconds ?? true
	const time = includeSeconds
		? `${hours24}:${minutes}:${seconds}`
		: `${hours24}:${minutes}`
	return `${year}年${month}月${day}日 ${time}`
}

export const formatDateTimeSlash = (
	value: DateInput,
	options?: { includeSeconds?: boolean },
) => {
	const date = toDate(value)
	if (!date) return ''
	const { year, month, day, hours24, minutes, seconds } = getParts(date)
	const includeSeconds = options?.includeSeconds ?? true
	const time = includeSeconds
		? `${hours24}:${minutes}:${seconds}`
		: `${hours24}:${minutes}`
	return `${year}/${month}/${day} ${time}`
}

export const formatDateTimeJaWithUnits = (
	value: DateInput,
	options?: { includeSeconds?: boolean; hour12?: boolean },
) => {
	const date = toDate(value)
	if (!date) return ''
	const { year, month, day, hours24, hours12, minutes, seconds } =
		getParts(date)
	const includeSeconds = options?.includeSeconds ?? true
	const hours = options?.hour12 ? hours12 : hours24
	const secondsPart = includeSeconds ? `${seconds}秒` : ''
	return `${year}年${month}月${day}日${hours}時${minutes}分${secondsPart}`
}

export const formatTimeHm = (
	value: DateInput,
	options?: { hour12?: boolean },
) => {
	const date = toDate(value)
	if (!date) return ''
	const { hours24, hours12, minutes } = getParts(date)
	return `${options?.hour12 ? hours12 : hours24}:${minutes}`
}

export const formatSlashWithWeekdayRange = (
	start: DateInput,
	end: DateInput,
	options?: { space?: boolean },
) => {
	const startLabel = formatDateSlashWithWeekday(start, options)
	const endLabel = formatDateSlashWithWeekday(end, options)
	return `${startLabel} - ${endLabel}`
}

export const formatIcsDateTime = (value: DateInput) => {
	const date = toDate(value)
	if (!date) return ''
	const year = date.getUTCFullYear().toString()
	const month = pad(date.getUTCMonth() + 1)
	const day = pad(date.getUTCDate())
	const hours = pad(date.getUTCHours())
	const minutes = pad(date.getUTCMinutes())
	const seconds = pad(date.getUTCSeconds())
	return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}

export const formatDateTimeCompact = (
	value: DateInput,
	options?: { useUTC?: boolean },
) => {
	const date = toDate(value)
	if (!date) return ''
	const useUTC = options?.useUTC ?? false
	const year = (useUTC ? date.getUTCFullYear() : date.getFullYear()).toString()
	const month = pad(useUTC ? date.getUTCMonth() + 1 : date.getMonth() + 1)
	const day = pad(useUTC ? date.getUTCDate() : date.getDate())
	const hours = pad(useUTC ? date.getUTCHours() : date.getHours())
	const minutes = pad(useUTC ? date.getUTCMinutes() : date.getMinutes())
	const seconds = pad(useUTC ? date.getUTCSeconds() : date.getSeconds())
	return `${year}${month}${day}T${hours}${minutes}${seconds}`
}

export const formatMonthDay = (
	value: DateInput,
	options?: { separator?: string; pad?: boolean },
) => {
	const date = toDate(value)
	if (!date) return ''
	const separator = options?.separator ?? '/'
	const padded = options?.pad ?? true
	const month = padded
		? pad(date.getMonth() + 1)
		: (date.getMonth() + 1).toString()
	const day = padded ? pad(date.getDate()) : date.getDate().toString()
	return `${month}${separator}${day}`
}

export const formatWeekday = (
	value: DateInput,
	options?: { enclosed?: boolean },
) => {
	const date = toDate(value)
	if (!date) return ''
	const label = WEEKDAY_JA[date.getDay()]
	return options?.enclosed ? `(${label})` : label
}
