import Link from "next/link";

export function PublicFooter() {
    return (
        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t font-light text-xs text-gray-500 bg-gray-50">
            <p>© 2026 FlowAudit Inc. All rights reserved.</p>
            <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                <Link className="hover:underline underline-offset-4" href="/terms-of-use">
                    Terms of Service
                </Link>
                <Link className="hover:underline underline-offset-4" href="/privacy-policy">
                    Privacy Policy
                </Link>
            </nav>
        </footer>
    );
}
