'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Mail, Lock, Chrome, Apple } from 'lucide-react';
import { useState } from 'react';
import { signIn } from '@/app/actions/auth';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn(email, password);
            if (!result.success) {
                setError(result.error || 'Erro ao fazer login');
                setLoading(false);
            }
            // If successful, will redirect based on profile status
        } catch (err) {
            setError('Erro inesperado ao fazer login');
            setLoading(false);
        }
    };

    const handleTestUser = () => {
        setEmail('user@teste.local');
        setPassword('@123');
    };

    const handleGoogleLogin = () => {
        alert('Google OAuth em breve!');
    };

    const handleAppleLogin = () => {
        alert('Apple OAuth em breve!');
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
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm text-red-100">
                        {error}
                    </div>
                )}

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
                                disabled={loading}
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
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Link
                            href="/forgot-password"
                            className="text-sm text-purple-100 hover:text-white transition-colors"
                        >
                            Esqueceu a senha?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-gradient-purple hover:bg-gradient-purple-hover text-white font-semibold h-11 shadow-purple"
                        disabled={loading}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </Button>

                    {process.env.NODE_ENV === 'development' && (
                        <Button
                            type="button"
                            onClick={handleTestUser}
                            variant="outline"
                            className="w-full bg-white/5 border-white/20 text-purple-200 hover:bg-white/10"
                            disabled={loading}
                        >
                            🧪 Usuário de Teste
                        </Button>
                    )}
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
