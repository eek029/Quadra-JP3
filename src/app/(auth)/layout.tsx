import { Logo } from '@/components/layout/logo';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-purple animate-gradient">
            {/* Logo at top */}
            <div className="flex justify-center pt-8 pb-4">
                <Logo size={100} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md animate-fade-in">{children}</div>
            </div>

            {/* Footer */}
            <footer className="text-white text-center py-6 px-4">
                <p className="text-sm opacity-90 mb-4">
                    © {new Date().getFullYear()} eek029 Sistemas e Automação
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Link
                        href="https://t.me/eek029"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                        aria-label="Telegram"
                    >
                        <MessageCircle className="h-5 w-5" />
                    </Link>
                    <Link
                        href="https://x.com/eek029"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                        aria-label="X (Twitter)"
                    >
                        <FaXTwitter className="h-5 w-5" />
                    </Link>
                </div>
            </footer>
        </div>
    );
}
