const JST_TIME_ZONE = 'Asia/Tokyo'
const DATE_KEY_FORMATTER = new Intl.DateTimeFormat('sv-SE', {
	timeZone: JST_TIME_ZONE,
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
})

const MS_PER_DAY = 24 * 60 * 60 * 1000

type Dateish = Date | string | number

const ensureDate = (value: Dateish, label: string): Date => {
	if (value instanceof Date) {
		const cloned = new Date(value.getTime())
		if (Number.isNaN(cloned.getTime())) {
			throw new RangeError(`${label} is not a valid date`)
		}
		return cloned
	}

	const date = new Date(value)
	if (Number.isNaN(date.getTime())) {
		throw new RangeError(`${label} is not a valid date`)
	}
	return date
}

const addDays = (date: Date, offsetDays: number): Date =>
	new Date(date.getTime() + offsetDays * MS_PER_DAY)

export interface JstDateKeyOptions {
	base?: Dateish
	offsetDays?: number
}

/**
 * 入力された日時を日本標準時 (JST) の日付キー (YYYY-MM-DD) に変換する。
 * @param input - Date/文字列/数値で指定された日時
 * @param options.offsetDays - JST 上で日数を加減算したい場合のオフセット
 */
export const toDateKey = (
	input: Dateish,
	options?: Pick<JstDateKeyOptions, 'offsetDays'>,
): string => {
	const date = ensureDate(input, 'input date')
	const offsetDays = options?.offsetDays ?? 0
	const adjusted = offsetDays === 0 ? date : addDays(date, offsetDays)
	return DATE_KEY_FORMATTER.format(adjusted)
}

/**
 * 現在 (または指定した日時) を基準に JST の日付キー (YYYY-MM-DD) を返す。
 * @param options.base - 基準となる日時 (省略時は現在時刻)
 * @param options.offsetDays - JST 上で日数を加減算する値
 */
export const getCurrentJSTDateString = ({
	base,
	offsetDays,
}: JstDateKeyOptions = {}): string => {
	const baseDate = ensureDate(base ?? Date.now(), 'base')
	return toDateKey(baseDate, { offsetDays: offsetDays ?? 0 })
}

/**
 * 日付を JST 基準の 0 時 (UTC では前日の 15 時) に合わせた ISO 文字列に変換する。
 * @param date - 変換したい日付
 */
export const DateToDayISOstring = (date: Date): string => {
	const dateKey = toDateKey(date)
	return `${dateKey}T00:00:00.000Z`
}

/**
 * 10年前から7年後までの「XX年度」→「XX」形式のマップを生成する。
 */
export const generateFiscalYearObject = (): Record<string, string> => {
	const currentYear = generateAcademicYear()
	const startYear = currentYear - 10
	const endYear = currentYear + 7
	const fiscalYearObject: Record<string, string> = {}
	for (let year = startYear; year <= endYear; year++) {
		const value = `${year % 100}`
		const key = `${year % 100}年度`
		fiscalYearObject[key] = value
	}
	return fiscalYearObject
}

/**
 * 指定した日 (省略時は現在) が属する学年度の西暦を返す。
 * 1〜3月は前年、それ以外はその年を返す。
 * @param today - 学年度を判定したい日
 */
export const generateAcademicYear = (today: Date = new Date()) => {
	const currentYearFull = today.getFullYear()
	const currentMonth = today.getMonth() + 1
	const academicYear = currentMonth <= 3 ? currentYearFull - 1 : currentYearFull
	return academicYear
}
