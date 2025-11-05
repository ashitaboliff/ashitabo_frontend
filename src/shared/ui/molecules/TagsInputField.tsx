'use client'

import {
	type ChangeEvent,
	type KeyboardEvent,
	type ReactNode,
	useEffect,
	useState,
} from 'react'
import { type Control, Controller, type UseFormSetValue } from 'react-hook-form'
import LabelInputField from '@/shared/ui/atoms/LabelInputField'
import { HiMiniXMark } from '@/shared/ui/icons'

type TagInputFieldProps = {
	name: string
	label?: string
	labelId?: string
	infoDropdown?: ReactNode
	placeholder?: string
	// biome-ignore lint/suspicious/noExplicitAny: react-hook-form control uses form-specific generics
	control?: Control<any>
	defaultValue?: string[]
	// biome-ignore lint/suspicious/noExplicitAny: react-hook-form setter uses form-specific generics
	setValue?: UseFormSetValue<any> // setValueは直接使用されていないため、将来的な用途がなければ削除も検討
	onChange?: (tags: string[]) => void
}

const TagInputField = ({
	name,
	label,
	labelId,
	infoDropdown,
	placeholder = 'タグを入力しEnterかカンマで追加',
	control,
	defaultValue = [],
	onChange,
}: TagInputFieldProps) => {
	// tagsステートは、controlがない場合、またはdefaultValueの初期値として使用
	const [tags, setTags] = useState<string[]>(defaultValue || [])
	const [inputValue, setInputValue] = useState<string>('')

	// defaultValueが変更された場合、かつcontrolがない場合にtagsを更新
	useEffect(() => {
		if (!control) {
			// defaultValueが実際に変更された場合のみtagsを更新する
			// JSON.stringifyはパフォーマンスに影響する可能性があるため、より効率的な比較方法も検討できる
			if (JSON.stringify(defaultValue) !== JSON.stringify(tags)) {
				setTags(defaultValue || [])
			}
		}
		// controlがある場合は、field.valueが優先されるため、このuseEffectでの更新は不要
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [defaultValue, control, tags]) // controlを依存配列に追加

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value)
	}

	const addTagInternal = (
		tagValue: string,
		currentTags: string[],
		fieldOnChange?: (value: string[]) => void,
	) => {
		const newTag = tagValue.trim()
		if (newTag && !currentTags.includes(newTag)) {
			const newTagsArray = [...currentTags, newTag]
			if (fieldOnChange) {
				fieldOnChange(newTagsArray)
			} else if (onChange) {
				setTags(newTagsArray)
				onChange(newTagsArray)
			} else {
				setTags(newTagsArray)
			}
		}
		setInputValue('')
	}

	const removeTagInternal = (
		tagToRemove: string,
		currentTags: string[],
		fieldOnChange?: (value: string[]) => void,
	) => {
		const newTagsArray = currentTags.filter((tag) => tag !== tagToRemove)
		if (fieldOnChange) {
			fieldOnChange(newTagsArray)
		} else if (onChange) {
			setTags(newTagsArray)
			onChange(newTagsArray)
		} else {
			setTags(newTagsArray)
		}
	}

	return (
		<div>
			{label && (
				<LabelInputField
					label={label}
					infoDropdown={infoDropdown}
					labelId={labelId}
				/>
			)}
			{control ? (
				<Controller
					name={name}
					control={control}
					defaultValue={defaultValue || []}
					render={({ field }) => {
						const currentControlledTags = field.value || []

						const handleKeyDownController = (
							e: KeyboardEvent<HTMLInputElement>,
						) => {
							if (e.key === 'Enter' || e.key === ',') {
								e.preventDefault()
								addTagInternal(
									inputValue,
									currentControlledTags,
									field.onChange,
								)
							}
						}

						return (
							<div className="flex flex-wrap items-center gap-2 rounded-md py-2">
								<div className="flex flex-wrap gap-2">
									{currentControlledTags.map((tag: string) => (
										<div
											key={tag}
											className="badge badge-info badge-outline gap-1 text-xs-custom sm:text-sm"
										>
											<span>{tag}</span>
											<button
												type="button"
												onClick={() =>
													removeTagInternal(
														tag,
														currentControlledTags,
														field.onChange,
													)
												}
												className="text-error"
												aria-label={`タグ ${tag} を削除`}
											>
												<HiMiniXMark />
											</button>
										</div>
									))}
								</div>
								<input
									id={labelId}
									type="text"
									value={inputValue}
									onChange={handleInputChange}
									onKeyDown={handleKeyDownController}
									placeholder={placeholder}
									className="input min-w-[150px] flex-grow bg-white text-sm sm:text-base"
									onBlur={() => {
										// 入力値がある場合のみタグを追加
										if (inputValue.trim()) {
											addTagInternal(
												inputValue,
												currentControlledTags,
												field.onChange,
											)
										}
									}}
								/>
							</div>
						)
					}}
				/>
			) : (
				// controlがない場合のレンダリング (ローカルのtagsステートを使用)
				<div className="flex flex-wrap items-center gap-2 rounded-md py-2">
					<div className="flex flex-wrap gap-2">
						{tags.map((tag) => (
							<div
								key={tag}
								className="badge badge-info badge-outline gap-1 text-xs-custom sm:text-sm"
							>
								<span>{tag}</span>
								<button
									type="button"
									onClick={() => removeTagInternal(tag, tags, onChange)}
									className="text-error"
									aria-label={`タグ ${tag} を削除`}
								>
									<HiMiniXMark />
								</button>
							</div>
						))}
					</div>
					<input
						type="text"
						value={inputValue}
						onChange={handleInputChange}
						onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
							if (e.key === 'Enter' || e.key === ',') {
								e.preventDefault()
								addTagInternal(inputValue, tags, onChange)
							}
						}}
						placeholder={placeholder}
						className="input min-w-[150px] flex-grow bg-white text-sm sm:text-base"
						onBlur={() => {
							if (inputValue.trim()) {
								addTagInternal(inputValue, tags, onChange)
							}
						}}
					/>
				</div>
			)}
		</div>
	)
}

export default TagInputField
