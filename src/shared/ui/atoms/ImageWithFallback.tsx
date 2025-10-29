'use client'

import { type ImgHTMLAttributes, useState } from 'react'

type Props = {
	src?: string
	alt?: string
	fallback?: string
} & ImgHTMLAttributes<HTMLImageElement>

const ImageWithFallback = ({
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

export default ImageWithFallback
