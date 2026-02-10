import Image from "next/image";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full">
            {/* Left Column - Form */}
            <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    {children}
                </div>
            </div>

            {/* Right Column - Artwork */}
            <div className="relative hidden w-0 flex-1 lg:block">
                <div className="absolute inset-0 h-full w-full bg-blue-600">
                    <Image
                        src="/auth-artwork.png"
                        alt="FlowAudit Visualization"
                        fill
                        className="object-cover opacity-90"
                        priority
                    />
                    <div className="absolute inset-0 bg-blue-600/20 mix-blend-multiply" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-20 text-white z-10">
                    <h2 className="text-4xl font-bold mb-4">Connect with every application.</h2>
                    <p className="text-lg text-blue-100">Everything you need in an easily customizable dashboard.</p>
                    {/* Pagination dots simulation */}
                    <div className="flex gap-2 mt-8">
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                        <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                        <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
