import { describe, expect, it } from 'vitest'
import { StatusCode } from '@/types/response'
import {
	type FormattedErrorMessage,
	formatErrorAsString,
	formatErrorMessage,
} from './errorFormatter'

describe('formatErrorMessage', () => {
	describe('基本的なステータスコード処理', () => {
		it('400 Bad Request のエラーメッセージを生成する', () => {
			const result = formatErrorMessage(StatusCode.BAD_REQUEST, 'Invalid input')

			expect(result.title).toBe('入力内容に問題があります')
			expect(result.message).toContain('入力された情報に誤りがあります')
			expect(result.action).toBeDefined()
		})

		it('401 Unauthorized のエラーメッセージを生成する', () => {
			const result = formatErrorMessage(
				StatusCode.UNAUTHORIZED,
				'Not authenticated',
			)

			expect(result.title).toBe('認証が必要です')
			expect(result.message).toContain('ログインが必要')
			expect(result.action).toContain('ログイン')
		})

		it('403 Forbidden のエラーメッセージを生成する', () => {
			const result = formatErrorMessage(StatusCode.FORBIDDEN, 'Access denied')

			expect(result.title).toBe('アクセスが拒否されました')
			expect(result.message).toContain('権限がありません')
		})

		it('404 Not Found のエラーメッセージを生成する', () => {
			const result = formatErrorMessage(StatusCode.NOT_FOUND, 'Not found')

			expect(result.title).toBe('データが見つかりません')
			expect(result.message).toContain('見つかりませんでした')
		})

		it('409 Conflict のエラーメッセージを生成する', () => {
			const result = formatErrorMessage(StatusCode.CONFLICT, 'Data conflict')

			expect(result.title).toBe('データの競合が発生しました')
			expect(result.message).toContain('既に同じデータが存在')
		})

		it('500 Internal Server Error のエラーメッセージを生成する', () => {
			const result = formatErrorMessage(
				StatusCode.INTERNAL_SERVER_ERROR,
				'Server error',
			)

			expect(result.title).toBe('サーバーエラーが発生しました')
			expect(result.message).toContain('サーバー側で問題が発生')
			expect(result.action).toContain('時間をおいて再度')
		})
	})

	describe('コンテキストベースのカスタマイズ', () => {
		it('パスワード関連エラーを認識してカスタマイズする', () => {
			const result = formatErrorMessage(
				StatusCode.UNAUTHORIZED,
				'Invalid password',
			)

			expect(result.message).toContain('パスワードが正しくありません')
			expect(result.action).toContain('正しいパスワード')
		})

		it('予約の競合エラーを認識してカスタマイズする', () => {
			const result = formatErrorMessage(
				StatusCode.CONFLICT,
				'Booking already exists',
			)

			expect(result.message).toContain('既に予約されています')
			expect(result.action).toContain('別の時間帯')
		})

		it('バンド名の競合エラーを認識してカスタマイズする', () => {
			const result = formatErrorMessage(
				StatusCode.CONFLICT,
				'Band name already exists',
			)

			expect(result.message).toContain('同じ名前のバンドが既に存在')
			expect(result.action).toContain('別の名前')
		})

		it('ユーザーが見つからないエラーを認識してカスタマイズする', () => {
			const result = formatErrorMessage(StatusCode.NOT_FOUND, 'User not found')

			expect(result.message).toContain('ユーザーが見つかりません')
			expect(result.action).toContain('ログインし直す')
		})

		it('ファイルアップロードエラーを認識してカスタマイズする', () => {
			const result = formatErrorMessage(
				StatusCode.BAD_REQUEST,
				'Invalid file format',
			)

			expect(result.message).toContain('ファイル形式またはサイズに問題')
			expect(result.action).toContain('形式とサイズ制限を確認')
		})

		it('レート制限エラーを認識してカスタマイズする', () => {
			const result = formatErrorMessage(
				StatusCode.BAD_REQUEST,
				'Rate limit exceeded',
			)

			expect(result.title).toBe('リクエスト制限に達しました')
			expect(result.message).toContain('多くのリクエスト')
		})
	})

	describe('エラー詳細の抽出', () => {
		it('文字列の詳細情報を抽出する', () => {
			const result = formatErrorMessage(
				StatusCode.BAD_REQUEST,
				'Error',
				'Detailed error message',
			)

			expect(result.details).toBe('Detailed error message')
		})

		it('バリデーションエラーの詳細を抽出する', () => {
			const details = {
				errors: {
					name: 'Name is required',
					email: 'Invalid email format',
				},
			}

			const result = formatErrorMessage(
				StatusCode.BAD_REQUEST,
				'Error',
				details,
			)

			expect(result.details).toContain('name')
			expect(result.details).toContain('Name is required')
			expect(result.details).toContain('email')
		})

		it('detail プロパティを持つオブジェクトから詳細を抽出する', () => {
			const details = {
				detail: 'Specific error detail',
			}

			const result = formatErrorMessage(
				StatusCode.BAD_REQUEST,
				'Error',
				details,
			)

			expect(result.details).toBe('Specific error detail')
		})
	})

	describe('formatErrorAsString', () => {
		it('完全なエラーメッセージを文字列に変換する', () => {
			const formatted: FormattedErrorMessage = {
				title: 'エラー',
				message: 'エラーが発生しました',
				action: '再度お試しください',
				details: '詳細情報',
			}

			const result = formatErrorAsString(formatted)

			expect(result).toContain('エラーが発生しました')
			expect(result).toContain('再度お試しください')
			expect(result).toContain('詳細: 詳細情報')
		})

		it('アクションがない場合は省略する', () => {
			const formatted: FormattedErrorMessage = {
				title: 'エラー',
				message: 'エラーが発生しました',
			}

			const result = formatErrorAsString(formatted)

			expect(result).toBe('エラーが発生しました')
		})
	})
})
