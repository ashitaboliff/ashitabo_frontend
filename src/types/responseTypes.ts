// ステータスコードの列挙型
export enum StatusCode {
	// 成功系
	OK = 200,
	CREATED = 201,
	NO_CONTENT = 204,

	REDIRECT = 303,

	// クライアントエラー系
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	FORBIDDEN = 403,
	NOT_FOUND = 404,
	CONFLICT = 409,

	// サーバーエラー系
	INTERNAL_SERVER_ERROR = 500,
	BAD_GATEWAY = 502,
	SERVICE_UNAVAILABLE = 503,
}

export type SuccessStatus =
	| StatusCode.OK
	| StatusCode.CREATED
	| StatusCode.NO_CONTENT
	| StatusCode.REDIRECT

export type ErrorStatus =
	| StatusCode.BAD_REQUEST
	| StatusCode.UNAUTHORIZED
	| StatusCode.FORBIDDEN
	| StatusCode.NOT_FOUND
	| StatusCode.CONFLICT
	| StatusCode.INTERNAL_SERVER_ERROR
	| StatusCode.BAD_GATEWAY
	| StatusCode.SERVICE_UNAVAILABLE

export type ApiSuccess<T> = {
	ok: true
	status: SuccessStatus
	data: T
}

export type ApiError = {
	ok: false
	status: ErrorStatus
	message: string
	details?: unknown
}

// 統一的な API レスポンス型
export type ApiResponse<T> = ApiSuccess<T> | ApiError
