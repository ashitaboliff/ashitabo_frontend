'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from '@/features/auth/hooks/useSession'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next-nprogress-bar'
import * as zod from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { RoleMap, PartOptions, Part } from '@/features/user/types'
import { ApiError, StatusCode } from '@/types/responseTypes'
import { generateFiscalYearObject, generateAcademicYear } from '@/utils'
import AuthLoadingIndicator from './AuthLoadingIndicator'
import ErrorMessage from '@/components/ui/atoms/ErrorMessage'
import TextInputField from '@/components/ui/atoms/TextInputField'
import SelectField from '@/components/ui/atoms/SelectField'
import Popup from '@/components/ui/molecules/Popup'
import { createProfileAction } from './actions'
import { getClientAuthState } from '@/lib/auth/unifiedAuth'
import { signOutUser } from '@/features/user/actions'

const academicYearLastTwoDigits = generateAcademicYear() % 100

// 過去8年分の年度を生成
const validYears = Array.from(
	{ length: 9 },
	(_, i) => (academicYearLastTwoDigits - i + 100) % 100,
).map((year) => year.toString().padStart(2, '0'))

// 有効な年度を使って正規表現を作成
const yearRegex = `(${validYears.join('|')})`

const expectedYear = generateFiscalYearObject()

const expectedYearValues = Object.values(expectedYear).map((v) => String(v))
const roleKeys = Object.keys(RoleMap)

const schema = zod
	.object({
		name: zod.string().min(1, '名前を入力してください'),
		role: zod.string().refine((v) => roleKeys.includes(v), {
			message: 'どちらかを選択してください',
		}),
		studentId: zod
			.string()
			.regex(
				new RegExp(`^${yearRegex}[A-Za-z](\\d{1}\\d{3}[A-Za-z]|\\d{3})$`),
				'学籍番号のフォーマットが正しくありません',
			)
			.optional(),
		expected: zod.string().optional(),
		part: zod
			.array(
				zod
					.string()
					.refine(
						(v) =>
							Object.values(PartOptions).includes(
								v as (typeof PartOptions)[keyof typeof PartOptions],
							),
						{ message: '使用楽器を選択してください' },
					),
			)
			.min(1, '使用楽器を選択してください'),
	})
	.superRefine((data, ctx) => {
		if (data.role === 'STUDENT') {
			if (!data.studentId) {
				ctx.addIssue({
					code: zod.ZodIssueCode.custom,
					message: '学籍番号を入力してください',
					path: ['studentId'],
				})
			}
			if (!data.expected) {
				ctx.addIssue({
					code: zod.ZodIssueCode.custom,
					message: '卒業予定年度を選択してください',
					path: ['expected'],
				})
			} else if (!expectedYearValues.includes(data.expected)) {
				ctx.addIssue({
					code: zod.ZodIssueCode.custom,
					message: '卒業予定年度を選択してください',
					path: ['expected'],
				})
			}
		}
	})

const SigninSetting = () => {
	const router = useRouter()
	const session = useSession()
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [loadingMessage, setLoadingMessage] = useState<string>('処理中です...')
	const [error, setIsError] = useState<ApiError>()
	const [popupOpen, setPopupOpen] = useState<boolean>(false)

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm({
		mode: 'onBlur',
		resolver: zodResolver(schema),
		defaultValues: {
			role: 'STUDENT',
		},
	})

	const watchPart = watch('part', [])
	const watchRole = watch('role')
	const watchStudentId = watch('studentId')

	useEffect(() => {
		if (watchStudentId && watchRole === 'STUDENT') {
			const yearPrefix = watchStudentId.substring(0, 2) // 最初の2桁を取得
			const alphabet = watchStudentId.charAt(2).toUpperCase() // 3文字目のアルファベットを取得

			let yearOffset = 4 // デフォルトのオフセット
			switch (alphabet) {
				case 'T':
				case 't':
					yearOffset = 6
					break
				case 'E':
				case 'e':
				case 'G':
				case 'g':
				case 'F':
				case 'f':
				case 'C':
				case 'c':
					yearOffset = 4
					break
				case 'W':
				case 'w':
					yearOffset = 2
					break
				default:
					yearOffset = 4
			}

			const expectedYearValue = `${(parseInt(yearPrefix) + yearOffset) % 100}`

			// expectedYearオブジェクトに存在するか確認
			if (expectedYear[expectedYearValue + '年度']) {
				setValue('expected', expectedYearValue) // expectedフィールドに値を設定
			}
		}
	}, [watchStudentId, watchRole, setValue])

	const onSubmit = async (data: any) => {
		setLoadingMessage('プロフィールを保存しています...')
		setIsLoading(true)
		setIsError(undefined)
		const sessionStatus = session.data
			? getClientAuthState(session.data)
			: 'no-session'

		if (sessionStatus === 'no-session') {
			setIsError({
				ok: false,
				status: StatusCode.UNAUTHORIZED,
				message: 'ログイン情報がありません。再度ログインしてください。',
			})
			// router.push('/auth/signin'); // 必要に応じてサインインページへリダイレクト
		} else if (sessionStatus === 'profile') {
			setIsError({
				ok: false,
				status: StatusCode.FORBIDDEN,
				message:
					'プロフィールは既に作成されています。編集ページをご利用ください。',
			})
			router.push('/user/edit')
		} else if (sessionStatus === 'session') {
			// 'session' はプロファイル未作成の有効なセッション
			const userId = session.data?.user.id || ''
			if (!userId) {
				setIsError({
					ok: false,
					status: StatusCode.UNAUTHORIZED,
					message: 'ユーザーIDが取得できませんでした。',
				})
				setIsLoading(false)
				return
			}
			try {
				const res = await createProfileAction({
					userId,
					body: data,
				})
				if (res.ok) {
					await session.update({ triggerUpdate: Date.now() })
					setPopupOpen(true)
				} else {
					setIsError(res)
				}
			} catch (error) {
				setIsError({
					ok: false,
					status: 500,
					message:
						'エラーが発生しました、このエラーが何度も発生する場合はわたべにお問い合わせください',
					details: error instanceof Error ? error.message : String(error),
				})
				console.error('Error during profile creation:', error)
			}
		}
		setIsLoading(false)
	}

	return (
		<div className="flex flex-col items-center justify-center p-4 bg-white shadow-lg rounded-lg relative">
			{' '}
			{isLoading && <AuthLoadingIndicator message={loadingMessage} />}{' '}
			<h1 className="text-2xl font-bold">ユーザ設定</h1>
			<form
				className="flex flex-col space-y-4 w-full max-w-xs"
				onSubmit={handleSubmit(onSubmit)}
			>
				<TextInputField
					type="text"
					register={register('name')}
					label="本名"
					infoDropdown="アカウント管理のために本名を入力してください。"
					errorMessage={errors.name?.message}
				/>

				<div className="flex flex-row items-center space-x-2">
					<label className="label cursor-pointer">
						<input
							type="radio"
							value="STUDENT"
							{...register('role')}
							className="radio radio-primary"
							defaultChecked
						/>
						<span className="label-text">現役生</span>
					</label>

					<label className="label cursor-pointer">
						<input
							type="radio"
							value="GRADUATE"
							{...register('role')}
							className="radio radio-primary"
						/>
						<span className="label-text">卒業生</span>
					</label>
					{errors.role && (
						<span className="label-text-alt text-error">
							{errors.role.message}
						</span>
					)}
				</div>

				<SelectField
					name="part"
					register={register('part')}
					options={PartOptions}
					label="使用楽器(複数選択可)"
					isMultiple={true}
					setValue={setValue}
					watchValue={watchPart as Part[]}
					infoDropdown={
						<>
							使用楽器を選択してください、複数選択可能です。
							<br />
							また、他の楽器経験があればその他を選択してください。
						</>
					}
					errorMessage={errors.part?.message}
				/>

				{watchRole === 'STUDENT' && (
					<>
						<TextInputField
							type="text"
							register={register('studentId')}
							label="学籍番号"
							infoDropdown={
								<>
									信州大学および長野県立大学の学籍番号のフォーマットに対応しています。
								</>
							}
							errorMessage={errors.studentId?.message}
						/>

						<SelectField
							name="expected"
							register={register('expected')}
							options={expectedYear}
							label="卒業予定年度"
							infoDropdown={
								<>この値はいつでも変更できます。留年しても大丈夫！（笑）</>
							}
							errorMessage={errors.expected?.message}
						/>
						<p className="text-sm">
							※学籍番号から工学部生は院進を想定し、留年を想定していない値が自動計算されます。変更したい場合は編集を行ってください
						</p>
					</>
				)}

				<div className="flex flex-row sm:flex-col items-center space-x-2 sm:space-x-0 sm:space-y-2 justify-center">
					<button type="submit" className="btn btn-primary">
						保存
					</button>
					<button
						type="button"
						className="btn btn-outline"
						onClick={() => signOutUser()}
					>
						サインアウト
					</button>
				</div>
			</form>
			<ErrorMessage error={error} />
			<Popup
				id="signin-setting-popup"
				open={popupOpen}
				title="保存完了"
				onClose={() => setPopupOpen(false)}
			>
				<div className="p-4 flex flex-col justify-center gap-2">
					<p>プロフィールを保存しました</p>
					<button
						className="btn btn-primary"
						onClick={() => router.push('/user')}
					>
						ユーザーページに移動
					</button>
				</div>
			</Popup>
		</div>
	)
}

export default SigninSetting
