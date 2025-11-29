import { Sidebar } from '@/components/Sidebar';
import { RightSidebar } from '@/components/RightSidebar';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="container mx-auto max-w-[1265px] flex min-h-screen">
            {/* Left Sidebar */}
            <header className="w-[275px] flex-shrink-0">
                <Sidebar />
            </header>

            {/* Main Content */}
            <main className="flex-grow border-x border-[var(--border-color)] min-h-screen w-[600px] max-w-[600px]">
                {children}
            </main>

            {/* Right Sidebar */}
            <div className="flex-shrink-0 w-[350px]">
                <RightSidebar />
            </div>
        </div>
    );
}
