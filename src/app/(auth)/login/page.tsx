'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Mail, Lock, Chrome, Apple } from 'lucide-react';
import { useState } from 'react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement Supabase authentication
        console.log('Login:', { email, password });
    };

    const handleGoogleLogin = () => {
        // TODO: Implement Google OAuth
        console.log('Google login');
    };

    const handleAppleLogin = () => {
        // TODO: Implement Apple OAuth
        console.log('Apple login');
    };

    return (
        <Card className="glass-dark border-white/20 shadow-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white">
                    Reserva Quadra
                </CardTitle>
                <CardDescription className="text-purple-100">
                    Complexo Júlio Prestes
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Email/Password Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-white">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-200" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-200"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-white"
                        >
                            Senha
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-200" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-200"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Link
                            href="/esqueci-senha"
                            className="text-sm text-purple-100 hover:text-white transition-colors"
                        >
                            Esqueceu a senha?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-gradient-purple hover:bg-gradient-purple-hover text-white font-semibold h-11 shadow-purple"
                    >
                        Entrar
                    </Button>
                </form>

                {/* Separator */}
                <div className="relative">
                    <Separator className="bg-white/20" />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-transparent px-2 text-sm text-purple-100">
                        ou continue com
                    </span>
                </div>

                {/* OAuth Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleLogin}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                        <Chrome className="mr-2 h-4 w-4" />
                        Google
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleAppleLogin}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                        <Apple className="mr-2 h-4 w-4" />
                        Apple
                    </Button>
                </div>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-purple-100">
                    Não tem uma conta?{' '}
                    <Link
                        href="/signup"
                        className="font-semibold text-white hover:underline"
                    >
                        Cadastre-se
                    </Link>
                </p>
            </CardContent>
        </Card>
    );
}
