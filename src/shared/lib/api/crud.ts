import type { ApiClientOptions } from '@/shared/lib/api'
import { apiRequest } from '@/shared/lib/api'

const withMethod =
	(method: ApiClientOptions['method']) =>
	<T>(path: string, options?: Omit<ApiClientOptions, 'method'>) =>
		apiRequest<T>(path, {
			...options,
			method,
		})

export const apiGet = withMethod('GET')
export const apiPost = withMethod('POST')
export const apiPut = withMethod('PUT')
export const apiPatch = withMethod('PATCH')
export const apiDelete = withMethod('DELETE')
