import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusCode } from '@/types/response'
import { useFeedback } from './useFeedback'

describe('useFeedback', () => {
	describe('showApiError', () => {
		it('400エラーをフォーマットしてユーザー向けメッセージを表示する', () => {
			const { result } = renderHook(() => useFeedback())

			act(() => {
				result.current.showApiError({
					ok: false,
					status: StatusCode.BAD_REQUEST,
					message: 'Invalid input data',
				})
			})

			expect(result.current.feedback).toBeDefined()
			expect(result.current.feedback?.kind).toBe('error')
			expect(result.current.feedback?.title).toBe('入力内容に問題があります')
			expect(result.current.feedback?.message).toContain(
				'入力された情報に誤りがあります',
			)
			expect(result.current.feedback?.message).toContain(
				'入力内容を確認して、もう一度お試しください',
			)
			expect(result.current.feedback?.code).toBe(StatusCode.BAD_REQUEST)
		})

		it('401エラーでログインを促すメッセージを表示する', () => {
			const { result } = renderHook(() => useFeedback())

			act(() => {
				result.current.showApiError({
					ok: false,
					status: StatusCode.UNAUTHORIZED,
					message: 'Not authenticated',
				})
			})

			expect(result.current.feedback?.title).toBe('認証が必要です')
			expect(result.current.feedback?.message).toContain('ログイン')
		})

		it('404エラーでデータが見つからないメッセージを表示する', () => {
			const { result } = renderHook(() => useFeedback())

			act(() => {
				result.current.showApiError({
					ok: false,
					status: StatusCode.NOT_FOUND,
					message: 'Resource not found',
				})
			})

			expect(result.current.feedback?.title).toBe('データが見つかりません')
			expect(result.current.feedback?.message).toContain('見つかりませんでした')
		})

		it('予約の競合エラーを適切にフォーマットする', () => {
			const { result } = renderHook(() => useFeedback())

			act(() => {
				result.current.showApiError({
					ok: false,
					status: StatusCode.CONFLICT,
					message: 'Booking already exists for this time slot',
				})
			})

			expect(result.current.feedback?.title).toBe('データの競合が発生しました')
			expect(result.current.feedback?.message).toContain(
				'この時間帯は既に予約されています',
			)
			expect(result.current.feedback?.message).toContain('別の時間帯を選択')
		})

		it('パスワードエラーを適切にフォーマットする', () => {
			const { result } = renderHook(() => useFeedback())

			act(() => {
				result.current.showApiError({
					ok: false,
					status: StatusCode.UNAUTHORIZED,
					message: 'Invalid password',
				})
			})

			expect(result.current.feedback?.message).toContain(
				'パスワードが正しくありません',
			)
			expect(result.current.feedback?.message).toContain(
				'正しいパスワードを入力',
			)
		})

		it('エラー詳細を含む場合は詳細情報を保持する', () => {
			const { result } = renderHook(() => useFeedback())

			act(() => {
				result.current.showApiError({
					ok: false,
					status: StatusCode.BAD_REQUEST,
					message: 'Validation failed',
					details: 'Name is required',
				})
			})

			expect(result.current.feedback?.details).toBe('Name is required')
		})

		it('バリデーションエラーの詳細を抽出する', () => {
			const { result } = renderHook(() => useFeedback())

			act(() => {
				result.current.showApiError({
					ok: false,
					status: StatusCode.BAD_REQUEST,
					message: 'Validation failed',
					details: {
						errors: {
							name: 'Name is required',
							email: 'Invalid email format',
						},
					},
				})
			})

			expect(result.current.feedback?.details).toBeDefined()
			expect(result.current.feedback?.details).toContain('name')
			expect(result.current.feedback?.details).toContain('email')
		})
	})

	describe('showError', () => {
		it('カスタムエラーメッセージを表示する', () => {
			const { result } = renderHook(() => useFeedback())

			act(() => {
				result.current.showError('カスタムエラーメッセージ', {
					title: 'カスタムタイトル',
					details: '詳細情報',
				})
			})

			expect(result.current.feedback?.kind).toBe('error')
			expect(result.current.feedback?.message).toBe('カスタムエラーメッセージ')
			expect(result.current.feedback?.title).toBe('カスタムタイトル')
			expect(result.current.feedback?.details).toBe('詳細情報')
		})
	})

	describe('showSuccess', () => {
		it('成功メッセージを表示する', () => {
			const { result } = renderHook(() => useFeedback())

			act(() => {
				result.current.showSuccess('操作が成功しました')
			})

			expect(result.current.feedback?.kind).toBe('success')
			expect(result.current.feedback?.message).toBe('操作が成功しました')
		})
	})

	describe('clearFeedback', () => {
		it('フィードバックをクリアする', () => {
			const { result } = renderHook(() => useFeedback())

			act(() => {
				result.current.showSuccess('テスト')
			})

			expect(result.current.feedback).toBeDefined()

			act(() => {
				result.current.clearFeedback()
			})

			expect(result.current.feedback).toBeNull()
		})
	})

	describe('初期値', () => {
		it('初期フィードバックを設定できる', () => {
			const { result } = renderHook(() =>
				useFeedback({
					kind: 'info',
					message: '初期メッセージ',
				}),
			)

			expect(result.current.feedback?.kind).toBe('info')
			expect(result.current.feedback?.message).toBe('初期メッセージ')
		})
	})
})
