export const RightSidebar = () => {
    return (
        <div className="hidden lg:block w-[350px] pl-8 py-4 h-screen sticky top-0">
            {/* Search */}
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-gray-500">
                        <g><path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.73 3.815-1.945 5.207l4.711 4.71 1.414-1.414-4.71-4.71c-1.392 1.216-3.223 1.946-5.208 1.946-4.694 0-8.5-3.806-8.5-8.5z"></path></g>
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search"
                    className="w-full bg-[#202327] text-white rounded-full py-3 pl-12 pr-4 focus:outline-none focus:bg-black focus:ring-1 focus:ring-[var(--accent-color)] border border-transparent focus:border-[var(--accent-color)]"
                />
            </div>

            {/* Trends */}
            <div className="bg-[#16181c] rounded-2xl pt-3 mb-4">
                <h2 className="text-xl font-bold px-4 mb-3">What's happening</h2>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="px-4 py-3 hover:bg-[var(--hover-bg)] cursor-pointer transition-colors">
                        <div className="text-xs text-gray-500 flex justify-between">
                            <span>Trending in Japan</span>
                            <span>···</span>
                        </div>
                        <div className="font-bold">Trend #{i}</div>
                        <div className="text-xs text-gray-500">100K posts</div>
                    </div>
                ))}
                <div className="px-4 py-3 text-[var(--accent-color)] hover:bg-[var(--hover-bg)] rounded-b-2xl cursor-pointer transition-colors">
                    Show more
                </div>
            </div>

            {/* Who to follow */}
            <div className="bg-[#16181c] rounded-2xl pt-3">
                <h2 className="text-xl font-bold px-4 mb-3">Who to follow</h2>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="px-4 py-3 hover:bg-[var(--hover-bg)] cursor-pointer transition-colors flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-gray-600 rounded-full"></div>
                            <div className="flex flex-col">
                                <span className="font-bold hover:underline">User {i}</span>
                                <span className="text-gray-500 text-sm">@user{i}</span>
                            </div>
                        </div>
                        <button className="bg-white text-black font-bold px-4 py-1.5 rounded-full hover:bg-gray-200 transition-colors text-sm">
                            Follow
                        </button>
                    </div>
                ))}
                <div className="px-4 py-3 text-[var(--accent-color)] hover:bg-[var(--hover-bg)] rounded-b-2xl cursor-pointer transition-colors">
                    Show more
                </div>
            </div>
        </div>
    );
};
