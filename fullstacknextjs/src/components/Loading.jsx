export default function Loading({ message = "Loading..." }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] py-20">
            {/* Film Reel Spinner */}
            <div className="relative w-24 h-24 mb-6">
                {/* Outer ring */}
                <div className="absolute inset-0 border-4 border-red-600 rounded-full animate-spin">
                    {/* Film holes */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gray-900 rounded-full"></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-gray-900 rounded-full"></div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rounded-full"></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-gray-900 rounded-full"></div>
                </div>

                {/* Inner circle */}
                <div className="absolute inset-3 bg-gray-800 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>

            {/* Loading text */}
            <p className="text-xl font-semibold text-white mb-2">{message}</p>
            <div className="flex gap-1">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
        </div>
    );
}
