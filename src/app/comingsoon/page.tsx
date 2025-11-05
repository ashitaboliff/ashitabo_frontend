'use client'

import Link from 'next/link'

const GearIcon = ({ className }: { className?: string }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
		role="img"
	>
		<title>歯車のアイコン</title>
		<path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
		<path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
		<path d="M12 2v2" />
		<path d="M12 22v-2" />
		<path d="m17 20.66-1-1.73" />
		<path d="M11 10.27 7 3.34" />
		<path d="m20.66 17-1.73-1" />
		<path d="m3.34 7 1.73 1" />
		<path d="M14 12h8" />
		<path d="M2 12h2" />
		<path d="m20.66 7-1.73 1" />
		<path d="m3.34 17 1.73-1" />
		<path d="m17 3.34-1 1.73" />
		<path d="m11 13.73 -4 6.93" />
	</svg>
)

export default function ComingSoonPage() {
	return (
		<div className="flex min-h-[calc(100vh-4rem)] animate-fadeIn flex-col items-center justify-center py-10 text-center">
			{/* Adjust min-h if you have a fixed header/footer height, 4rem is an example for a 64px header */}
			<style jsx global>{`
				@keyframes fadeIn {
					from {
						opacity: 0;
						transform: translateY(20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				.animate-fadeIn {
					animation: fadeIn 0.8s ease-out forwards;
				}
				.gear-spin {
					animation: spin 10s linear infinite;
				}
				@keyframes spin {
					from {
						transform: rotate(0deg);
					}
					to {
						transform: rotate(360deg);
					}
				}
			`}</style>

			<div className="mb-12">
				<GearIcon className="gear-spin h-24 w-24 text-primary" />
			</div>

			<h1 className="mb-6 font-bold text-5xl text-primary md:text-6xl">
				鋭意製作中！
			</h1>
			<p className="mb-4 max-w-md text-base-content text-lg md:text-xl">
				新しい素晴らしい機能やコンテンツを準備しています。
			</p>
			<p className="mb-10 max-w-md text-base-content text-lg md:text-xl">
				もうしばらくお待ちください！
			</p>

			<div className="mb-10 w-full max-w-xs">
				<progress className="progress progress-primary w-full"></progress>
				<p className="mt-2 text-accent text-sm">進捗: 2% ...たぶん！</p>
			</div>

			<Link
				href="/home"
				className="btn btn-primary btn-wide shadow-lg transition-shadow duration-300 hover:shadow-xl"
			>
				ホームに戻る
			</Link>
		</div>
	)
}
