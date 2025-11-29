'use client';

import { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(91,112,131,0.4)]">
            <div className="bg-black w-full max-w-[600px] h-full md:h-auto md:max-h-[90vh] md:rounded-2xl flex flex-col relative overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 p-2 rounded-full hover:bg-[rgba(239,243,244,0.1)] transition-colors z-10"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-white">
                        <g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g>
                    </svg>
                </button>
                <div className="flex justify-center pt-4 pb-2">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 fill-white">
                        <g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g>
                    </svg>
                </div>
                <div className="px-8 pb-16 md:px-20">
                    {children}
                </div>
            </div>
        </div>
    );
};
