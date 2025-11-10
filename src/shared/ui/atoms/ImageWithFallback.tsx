'use client'

import Image, { type ImageProps } from 'next/image'
import { type ImgHTMLAttributes, useState } from 'react'

type Props = {
	src?: string
	alt?: string
	fallback?: string
} & ImgHTMLAttributes<HTMLImageElement>

const ImgWithFallback = ({
	src,
	alt = '',
	fallback = '/fallback.webp',
	...props
}: Props) => {
	const [imgSrc, setImgSrc] = useState<string>(
		src && src.trim() !== '' ? src : fallback,
	)

	const handleError = () => setImgSrc(fallback)

	return <img src={imgSrc} alt={alt} onError={handleError} {...props} />
}

export const ImageWithFallback = ({
	src,
	fallback = '/fallback.webp',
	...props
}: { src: string; fallback?: string } & ImageProps) => {
	const [imgSrc, setImgSrc] = useState<string>(
		src && src.trim() !== '' ? src : fallback,
	)

	const handleError = () => setImgSrc(fallback)

	return <Image src={imgSrc} onError={handleError} {...props} />
}

export default ImgWithFallback
