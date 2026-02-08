import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900">
            <h1 className="text-6xl font-bold text-blue-600">404</h1>
            <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
            <p className="mt-2 text-gray-600">
                Sorry, we couldn&apos;t find the page you&apos;re looking for.
            </p>
            <Link
                href="/"
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
                Go back home
            </Link>
        </div>
    );
}
