'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WalletButton } from './WalletButton';

export function Header() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	return (
		<header className="bg-white shadow-sm border-b border-gray-200">
			<nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<div className="flex items-center">
						<Link href="/" className="flex items-center space-x-2">
							<span className="text-2xl">🛡️</span>
							<span className="text-xl font-bold text-gray-900">
								Halo
							</span>
						</Link>
					</div>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center space-x-8">
						<Link
							href="/"
							className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition duration-200"
						>
							Home
						</Link>
						<Link
							href="/generate"
							className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition duration-200"
						>
							Generate Link
						</Link>
						<Link
							href="/connect"
							className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition duration-200"
						>
							Wallet Info
						</Link>
					</div>

					{/* Desktop Wallet Button */}
					<div className="hidden md:block">
						<WalletButton />
					</div>

					{/* Mobile menu button */}
					<div className="md:hidden flex items-center space-x-4">
						<div className="block md:hidden">
							<WalletButton />
						</div>
						<button
							onClick={() =>
								setIsMobileMenuOpen(!isMobileMenuOpen)
							}
							className="text-gray-700 hover:text-blue-600 focus:outline-none"
						>
							<svg
								className="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								{isMobileMenuOpen ? (
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								) : (
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 6h16M4 12h16M4 18h16"
									/>
								)}
							</svg>
						</button>
					</div>
				</div>

				{/* Mobile Navigation Menu */}
				{isMobileMenuOpen && (
					<div className="md:hidden">
						<div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 rounded-lg mt-2">
							<Link
								href="/"
								className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md text-sm font-medium transition duration-200"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								Home
							</Link>
							<Link
								href="/generate"
								className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md text-sm font-medium transition duration-200"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								Generate Link
							</Link>
							<Link
								href="/connect"
								className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md text-sm font-medium transition duration-200"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								Wallet Info
							</Link>
						</div>
					</div>
				)}
			</nav>
		</header>
	);
}
