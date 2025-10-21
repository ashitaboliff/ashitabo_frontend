import { type NextRequest, NextResponse } from 'next/server'
import { formatIcsDateTime } from '@/shared/utils/dateFormat'

// iCalendarの特殊文字をエスケープする関数
const escapeICSString = (str: string): string => {
	return str
		.replace(/\\/g, '\\\\') // Backslash
		.replace(/;/g, '\\;') // Semicolon
		.replace(/,/g, '\\,') // Comma
		.replace(/\n/g, '\\n') // Newline
}

// 日付をiCalendar形式 (YYYYMMDDTHHMMSSZ) にフォーマットする関数
const formatDateToICS = (dateString: string): string => {
	// ISO 8601形式の文字列をパースし、UTCとしてフォーマット
	const date = new Date(dateString)
	return formatIcsDateTime(date)
}

// iCalendarファイルを生成する関数
const generateICS = (
	start: string,
	end: string,
	summary: string,
	description: string,
): string => {
	const icsStart = formatDateToICS(start)
	const icsEnd = formatDateToICS(end)
	const escapedSummary = escapeICSString(summary)
	const escapedDescription = escapeICSString(description)

	return `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ashitabo//NONSGML v1.0//EN
BEGIN:VEVENT
DTSTART:${icsStart}
DTEND:${icsEnd}
SUMMARY:${escapedSummary}
DESCRIPTION:${escapedDescription}
END:VEVENT
END:VCALENDAR`.trim()
}

// APIルートのハンドラー
export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url)
	const start = searchParams.get('start')
	const end = searchParams.get('end')
	const summary = searchParams.get('summary')
	const description = searchParams.get('description')

	if (!start || !end || !summary || !description) {
		return NextResponse.json(
			{ error: 'Missing required query parameters' },
			{ status: 400 },
		)
	}

	const icsContent = generateICS(start, end, summary, description)

	// レスポンスヘッダーの設定
	return new NextResponse(icsContent, {
		headers: {
			'Content-Type': 'text/calendar',
			'Content-Disposition': 'attachment; filename=event.ics',
		},
	})
}
