'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Mail, Lock, User as UserIcon, Chrome, Apple, Phone, Calendar, Building, Home } from 'lucide-react';
import { useState } from 'react';
import { signUp, type SignUpData } from '@/app/actions/auth';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [tower, setTower] = useState<number>(1);
    const [block, setBlock] = useState('');
    const [apartment, setApartment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('As senhas não conferem!');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres');
            return;
        }

        // Validate age >= 18
        const birthDateObj = new Date(birthDate);
        const today = new Date();
        const age = today.getFullYear() - birthDateObj.getFullYear();
        const monthDiff = today.getMonth() - birthDateObj.getMonth();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
            ? age - 1
            : age;

        if (actualAge < 18) {
            setError('Você deve ter pelo menos 18 anos para se cadastrar');
            return;
        }

        setLoading(true);

        const signUpData: SignUpData = {
            email,
            password,
            metadata: {
                full_name: name,
                birth_date: birthDate,
                phone,
                tower,
                block: tower === 5 ? block : undefined,
                apartment,
            },
        };

        try {
            const result = await signUp(signUpData);
            if (!result.success) {
                setError(result.error || 'Erro ao criar conta');
                setLoading(false);
            }
            // If successful, will redirect to /perfil
        } catch (err) {
            setError('Erro inesperado ao criar conta');
            setLoading(false);
        }
    };

    const handleGoogleSignup = () => {
        alert('Google OAuth em breve!');
    };

    const handleAppleSignup = () => {
        alert('Apple OAuth em breve!');
    };

    return (
        <Card className="glass-dark border-white/20 shadow-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white">
                    Reserva Quadra
                </CardTitle>
                <CardDescription className="text-purple-100">
                    Complexo Júlio Prestes - Cadastro
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm text-red-100">
                        {error}
                    </div>
                )}

                {/* Signup Form */}
                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-white">
                            Nome completo
                        </label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-200" />
                            <Input
                                id="name"
                                type="text"
                                placeholder="Seu nome"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-200"
                                required
                            />
                        </div>
                    </div>

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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium text-white">
                                Telefone
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-200" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="(11) 99999-9999"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-200"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="birthDate" className="text-sm font-medium text-white">
                                Data de Nasc.
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-200" />
                                <Input
                                    id="birthDate"
                                    type="date"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    className="pl-10 bg-white/10 border-white/20 text-white"
                                    required
                                    disabled={loading}
                                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="tower" className="text-sm font-medium text-white">
                                Torre
                            </label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-200" />
                                <select
                                    id="tower"
                                    value={tower}
                                    onChange={(e) => setTower(Number(e.target.value))}
                                    className="w-full pl-10 h-10 bg-white/10 border border-white/20 rounded-md text-white"
                                    required
                                    disabled={loading}
                                >
                                    <option value="1" className="bg-purple-900">1</option>
                                    <option value="2" className="bg-purple-900">2</option>
                                    <option value="3" className="bg-purple-900">3</option>
                                    <option value="4" className="bg-purple-900">4</option>
                                    <option value="5" className="bg-purple-900">5</option>
                                </select>
                            </div>
                        </div>

                        {tower === 5 && (
                            <div className="space-y-2">
                                <label htmlFor="block" className="text-sm font-medium text-white">
                                    Bloco
                                </label>
                                <select
                                    id="block"
                                    value={block}
                                    onChange={(e) => setBlock(e.target.value)}
                                    className="w-full h-10 bg-white/10 border border-white/20 rounded-md text-white px-3"
                                    required
                                    disabled={loading}
                                >
                                    <option value="" className="bg-purple-900">Selecione</option>
                                    <option value="A" className="bg-purple-900">A</option>
                                    <option value="B" className="bg-purple-900">B</option>
                                </select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="apartment" className="text-sm font-medium text-white">
                                Apto
                            </label>
                            <div className="relative">
                                <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-200" />
                                <Input
                                    id="apartment"
                                    type="text"
                                    placeholder="101"
                                    value={apartment}
                                    onChange={(e) => setApartment(e.target.value)}
                                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-200"
                                    required
                                    disabled={loading}
                                />
                            </div>
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
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="confirmPassword"
                            className="text-sm font-medium text-white"
                        >
                            Confirmar senha
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-200" />
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-200"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-gradient-purple hover:bg-gradient-purple-hover text-white font-semibold h-11 shadow-purple"
                        disabled={loading}
                    >
                        {loading ? 'Cadastrando...' : 'Cadastrar'}
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
                        onClick={handleGoogleSignup}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                        <Chrome className="mr-2 h-4 w-4" />
                        Google
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleAppleSignup}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                        <Apple className="mr-2 h-4 w-4" />
                        Apple
                    </Button>
                </div>

                {/* Login Link */}
                <p className="text-center text-sm text-purple-100">
                    Já tem uma conta?{' '}
                    <Link
                        href="/login"
                        className="font-semibold text-white hover:underline"
                    >
                        Entre
                    </Link>
                </p>
            </CardContent>
        </Card>
    );
}
