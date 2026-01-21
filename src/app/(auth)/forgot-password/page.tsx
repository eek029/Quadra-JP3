'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { resetPassword } from '@/app/actions/auth';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await resetPassword(email);
            if (result.success) {
                setSuccess(true);
            } else {
                setError(result.error || 'Erro ao enviar email de recuperação');
            }
        } catch (err) {
            setError('Erro inesperado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="glass-dark border-white/20 shadow-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white">
                    Recuperar Senha
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

                {success ? (
                    <div className="space-y-4">
                        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-sm text-green-100">
                            <p className="font-semibold mb-2">Email enviado com sucesso!</p>
                            <p>Verifique seu email para redefinir sua senha.</p>
                        </div>
                        <Link href="/login">
                            <Button
                                variant="outline"
                                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Voltar para o login
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
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

                        <Button
                            type="submit"
                            className="w-full bg-gradient-purple hover:bg-gradient-purple-hover text-white font-semibold h-11 shadow-purple"
                            disabled={loading}
                        >
                            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                        </Button>

                        <Link href="/login">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                                disabled={loading}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Voltar para o login
                            </Button>
                        </Link>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}
