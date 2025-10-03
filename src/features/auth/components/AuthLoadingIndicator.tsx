const AuthLoadingIndicator = ({
	message = '処理中です...',
}: {
	message?: string
}) => {
	return (
		<div className="fixed inset-0 bg-black/30 flex flex-col items-center justify-center z-50">
			<div className="loading loading-spinner loading-lg"></div>
			<p className="text-white text-lg mt-4">{message}</p>
		</div>
	)
}

export default AuthLoadingIndicator
