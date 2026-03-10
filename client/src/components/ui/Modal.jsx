import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children }) {
    // Close on Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Panel */}
            <div className="relative w-full max-w-lg bg-slate-800 border border-slate-700/50
                            rounded-2xl shadow-2xl shadow-black/50 z-10 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                    <h2 className="text-white font-semibold text-lg">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-white
                                   hover:bg-slate-700 transition-all duration-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {/* Body */}
                <div className="overflow-y-auto p-6 flex flex-col gap-4">
                    {children}
                </div>
            </div>
        </div>
    );
}