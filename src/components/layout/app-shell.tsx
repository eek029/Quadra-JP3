'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    LayoutDashboard,
    Calendar,
    Clock,
    FileText,
    User,
    Menu,
    LogOut,
    Shield,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/reservas/nova', label: 'Nova Reserva', icon: Clock },
    { href: '/reservas/minhas', label: 'Minhas Reservas', icon: Calendar },
    { href: '/calendario', label: 'Calendário', icon: Calendar },
    { href: '/regras', label: 'Regras', icon: FileText },
    { href: '/perfil', label: 'Perfil', icon: User },
    { href: '/admin', label: 'Admin', icon: Shield },
];

interface AppShellProps {
    children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full bg-gradient-purple shadow-lg">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <Logo size={40} />
                            <div className="hidden sm:block">
                                <div className="text-lg font-bold text-white leading-tight">
                                    Reserva Quadra
                                </div>
                                <div className="text-xs text-purple-100 leading-tight">
                                    Complexo Júlio Prestes
                                </div>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link key={item.href} href={item.href}>
                                        <Button
                                            variant={isActive ? 'secondary' : 'ghost'}
                                            className={`gap-2 ${isActive
                                                ? 'text-purple-900'
                                                : 'text-white hover:bg-white/20'
                                                }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {item.label}
                                        </Button>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User Menu */}
                        <div className="flex items-center gap-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-10 w-10 rounded-full hover:bg-white/20"
                                    >
                                        <Avatar>
                                            <AvatarImage src="" alt="User" />
                                            <AvatarFallback className="bg-purple-200 text-purple-900">
                                                U
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/perfil" className="cursor-pointer">
                                            <User className="mr-2 h-4 w-4" />
                                            Perfil
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer text-red-600">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sair
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Mobile Menu Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden text-white hover:bg-white/20"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                <Menu className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <nav className="lg:hidden pb-4 animate-slide-up">
                            <div className="flex flex-col gap-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <Button
                                                variant={isActive ? 'secondary' : 'ghost'}
                                                className={`w-full justify-start gap-2 ${isActive
                                                    ? 'text-purple-900'
                                                    : 'text-white hover:bg-white/20'
                                                    }`}
                                            >
                                                <Icon className="h-4 w-4" />
                                                {item.label}
                                            </Button>
                                        </Link>
                                    );
                                })}
                            </div>
                        </nav>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                <div className="container mx-auto px-4 py-8">{children}</div>
            </main>

            {/* Footer */}
            <footer className="bg-gradient-purple text-white py-6">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm">
                        © {new Date().getFullYear()} eek029 Sistemas e Automação
                    </p>
                </div>
            </footer>
        </div>
    );
}
