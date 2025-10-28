export const getImageUrl = (imageName: string): string => {
	const baseUrl = 'https://cdn.ashitabo.net'
	return `${baseUrl}${imageName.startsWith('/') ? '' : '/'}${imageName}`
}
