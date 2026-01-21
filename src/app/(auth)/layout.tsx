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
                <div className="flex items-center justify-center gap-6 mb-4">
                    <Link
                        href="https://t.me/eek029"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-sm">Telegram</span>
                    </Link>
                    <Link
                        href="https://x.com/eek029"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        <FaXTwitter className="h-5 w-5" />
                        <span className="text-sm">X (Twitter)</span>
                    </Link>
                </div>
                <p className="text-sm opacity-90">
                    © {new Date().getFullYear()} Quadra-JP3. Todos os direitos
                    reservados.
                </p>
            </footer>
        </div>
    );
}
