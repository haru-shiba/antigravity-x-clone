'use client';

import { Timeline } from '@/features/timeline/components/Timeline';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
    const { isLoading } = useAuth();

    if (isLoading) {
        return <div className="min-h-screen bg-black text-white flex justify-center items-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-[var(--border-color)]">
                <div className="flex">
                    <div className="flex-1 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer p-4 text-center font-bold relative">
                        For you
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-14 h-1 bg-[var(--accent-color)] rounded-full"></div>
                    </div>
                    <div className="flex-1 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer p-4 text-center text-gray-500 font-medium">
                        Following
                    </div>
                </div>
            </div>
            <Timeline />
        </div>
    );
}
