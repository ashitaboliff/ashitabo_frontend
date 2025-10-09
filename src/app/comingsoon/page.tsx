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
	>
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
		<div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center py-10 animate-fadeIn">
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
				<GearIcon className="w-24 h-24 text-primary gear-spin" />
			</div>

			<h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">
				鋭意製作中！
			</h1>
			<p className="text-lg md:text-xl text-base-content mb-4 max-w-md">
				新しい素晴らしい機能やコンテンツを準備しています。
			</p>
			<p className="text-lg md:text-xl text-base-content mb-10 max-w-md">
				もうしばらくお待ちください！
			</p>

			<div className="w-full max-w-xs mb-10">
				<progress className="progress progress-primary w-full"></progress>
				<p className="text-sm text-accent mt-2">進捗: 2% ...たぶん！</p>
			</div>

			<Link
				href="/home"
				className="btn btn-primary btn-wide shadow-lg hover:shadow-xl transition-shadow duration-300"
			>
				ホームに戻る
			</Link>
		</div>
	)
}
