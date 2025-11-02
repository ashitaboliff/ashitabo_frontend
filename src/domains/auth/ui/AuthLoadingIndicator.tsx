interface Props {
	readonly message?: string
}

const AuthLoadingIndicator = ({ message = '処理中です...' }: Props) => {
	return (
		<div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/30">
			<div className="loading loading-spinner loading-lg"></div>
			<p className="mt-4 text-lg text-white">{message}</p>
		</div>
	)
}

export default AuthLoadingIndicator
