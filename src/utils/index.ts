/**
 * 現在の日本標準時 (JST) の日付文字列を取得する
 * @param yesterday - trueの場合、昨日の日付を返す
 * @param anyDate - 任意の日付オブジェクトを指定 (指定しない場合は現在日時)
 * @param now - 任意のタイムスタンプを指定 (指定しない場合は現在のタイムスタンプ)
 * @returns 日本標準時 (JST) の日付文字列 (YYYY-MM-DD)
 */
export const getCurrentJSTDateString = ({
	yesterday = false,
	anyDate,
	now = Date.now(),
}: {
	yesterday?: boolean
	anyDate?: Date
	now?: number
}): string => {
	const baseTimestamp = anyDate instanceof Date ? anyDate.getTime() : now
	const adjustedTimestamp =
		baseTimestamp - (yesterday ? 24 * 60 * 60 * 1000 : 0)
	const jstDate = new Date(adjustedTimestamp + 9 * 60 * 60 * 1000)
	const year = jstDate.getUTCFullYear()
	const month = (jstDate.getUTCMonth() + 1).toString().padStart(2, '0')
	const day = jstDate.getUTCDate().toString().padStart(2, '0')
	return `${year}-${month}-${day}`
}

export function DateToDayISOstring(date: Date): string {
	const utcDate = new Date(
		Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
	)
	const ISOstring = utcDate.toISOString()
	return ISOstring
}

/**
 * 10年前から7年後までの "XX年度" のオブジェクトを生成する
 * @returns "XX年度"のオブジェクト (例: { '23年度': '23', '24年度': '24', ... })
 */
export const generateFiscalYearObject = (): Record<string, string> => {
	const currentYear = generateAcademicYear() // 現在の年を取得
	const startYear = currentYear - 10 // 10年前
	const endYear = currentYear + 7 // 7年後

	// "XX年度"のオブジェクトを生成
	const fiscalYearObject: Record<string, string> = {}

	for (let year = startYear; year <= endYear; year++) {
		const value = `${year % 100}`
		const key = `${year % 100}年度`
		fiscalYearObject[key] = value
	}

	return fiscalYearObject
}

/**
 * 今年度の西暦を生成する
 * @param today - 任意の日付オブジェクトを指定 (指定しない場合は現在日時)
 * @returns 今年度の西暦 (例: 2023年度なら23を返す)
 */
export const generateAcademicYear = (today = new Date()) => {
	const currentYearFull = today.getFullYear() // 4桁の西暦
	const currentMonth = today.getMonth() + 1 // 月 (0が1月なので+1)

	// 学年度の調整（1月から3月は前年を使用）
	const academicYear = currentMonth <= 3 ? currentYearFull - 1 : currentYearFull
	const academicYearLastTwoDigits = academicYear

	return academicYearLastTwoDigits
}
