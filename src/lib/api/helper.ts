import {
	ApiError,
	ApiResponse,
	ApiSuccess,
	ErrorStatus,
	StatusCode,
	SuccessStatus,
} from '@/types/responseTypes'

const ensureMessage = (res: ApiError, fallback?: string): ApiError => ({
	...res,
	message: res.message || fallback || '不明なエラーが発生しました。',
})

export const success = <T>(status: SuccessStatus, data: T): ApiSuccess<T> => ({
	ok: true,
	status,
	data,
})

export const failure = (
	status: ErrorStatus,
	message: string,
	details?: unknown,
): ApiError => ({
	ok: false,
	status,
	message,
	details,
})

export const withFallbackMessage = <T>(
	res: ApiResponse<T>,
	fallback: string,
): ApiResponse<T> => {
	if (res.ok) {
		return res
	}
	return ensureMessage(res, fallback)
}

export const dataOrThrow = <T>(res: ApiResponse<T>, fallback?: string): T => {
	if (res.ok) {
		return res.data
	}
	throw ensureMessage(res, fallback)
}

export const okResponse = <T>(data: T): ApiSuccess<T> =>
	success(StatusCode.OK, data)

export const createdResponse = <T>(data: T): ApiSuccess<T> =>
	success(StatusCode.CREATED, data)

export const noContentResponse = (): ApiSuccess<null> =>
	success(StatusCode.NO_CONTENT, null)
