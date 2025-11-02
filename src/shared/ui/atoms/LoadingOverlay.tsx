const LoadingOverlay = () => {
	return (
		<div className="flex h-48 items-center justify-center">
			<div className="flex flex-col text-center">
				<span className="loading loading-spinner loading-lg text-accent"></span>
				<div className="mt-4 text-center text-base">Loading...</div>
			</div>
		</div>
	)
}

export default LoadingOverlay
