'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, Lock, Upload } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
    const [name, setName] = useState('João Silva');
    const [email, setEmail] = useState('joao@email.com');
    const [phone, setPhone] = useState('(11) 99999-9999');
    const [notifications, setNotifications] = useState(true);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Save profile:', { name, email, phone, notifications });
        alert('Perfil atualizado! (placeholder)');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-gradient-purple">Meu Perfil</h1>
                <p className="text-muted-foreground mt-2">
                    Gerencie suas informações pessoais
                </p>
            </div>

            {/* Profile Picture */}
            <Card>
                <CardHeader>
                    <CardTitle>Foto de Perfil</CardTitle>
                    <CardDescription>
                        Altere sua foto para personalizar seu perfil
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src="" alt="User" />
                            <AvatarFallback className="bg-gradient-purple text-white text-2xl">
                                JS
                            </AvatarFallback>
                        </Avatar>
                        <Button variant="outline" className="gap-2">
                            <Upload className="h-4 w-4" />
                            Alterar Foto
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>
                        Atualize seus dados cadastrais
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Nome Completo
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium">
                                Telefone
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <Button type="submit" className="bg-gradient-purple hover:opacity-90">
                            Salvar Alterações
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Password Change */}
            <Card>
                <CardHeader>
                    <CardTitle>Alterar Senha</CardTitle>
                    <CardDescription>
                        Mantenha sua conta segura atualizando sua senha regularmente
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Senha Atual</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input type="password" placeholder="••••••••" className="pl-10" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nova Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input type="password" placeholder="••••••••" className="pl-10" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Confirmar Nova Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input type="password" placeholder="••••••••" className="pl-10" />
                            </div>
                        </div>

                        <Button variant="outline">Alterar Senha</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle>Preferências de Notificações</CardTitle>
                    <CardDescription>
                        Escolha como deseja receber notificações
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Notificações por Email</p>
                            <p className="text-sm text-muted-foreground">
                                Receba lembretes sobre suas reservas
                            </p>
                        </div>
                        <Button
                            variant={notifications ? 'default' : 'outline'}
                            onClick={() => setNotifications(!notifications)}
                            className={notifications ? 'bg-gradient-purple' : ''}
                        >
                            {notifications ? 'Ativado' : 'Desativado'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
