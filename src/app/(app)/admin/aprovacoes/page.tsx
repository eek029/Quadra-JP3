'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Phone, Building, Home, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, getProfile } from '@/app/actions/auth';
import {
    getPendingProfiles,
    approveProfile,
    rejectProfile,
    type PendingProfile,
} from '@/app/actions/approval';

export default function ApprovacoesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState<PendingProfile[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [currentProfile, setCurrentProfile] = useState<any>(null);
    const [error, setError] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const user = await getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            setCurrentUser(user);

            const profile = await getProfile(user.id);
            if (!profile) {
                router.push('/perfil');
                return;
            }

            setCurrentProfile(profile);

            // Check if user has permission
            const allowedRoles = ['doorman', 'sub_manager', 'general_manager', 'dev_admin'];
            if (!allowedRoles.includes(profile.role) || profile.status !== 'approved') {
                router.push('/dashboard');
                return;
            }

            const pending = await getPendingProfiles(user.id);
            setProfiles(pending);
        } catch (err) {
            setError('Erro ao carregar perfis pendentes');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (profileUserId: string) => {
        setProcessingId(profileUserId);
        setError('');

        try {
            const result = await approveProfile(profileUserId, currentUser.id);
            if (result.success) {
                await loadData(); // Reload list
            } else {
                setError(result.error || 'Erro ao aprovar perfil');
            }
        } catch (err) {
            setError('Erro inesperado');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (profileUserId: string) => {
        if (!rejectReason.trim()) {
            setError('Informe o motivo da rejeição');
            return;
        }

        setProcessingId(profileUserId);
        setError('');

        try {
            const result = await rejectProfile(profileUserId, currentUser.id, rejectReason);
            if (result.success) {
                setRejectReason('');
                await loadData(); // Reload list
            } else {
                setError(result.error || 'Erro ao rejeitar perfil');
            }
        } catch (err) {
            setError('Erro inesperado');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-white">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-white mb-6">Aprovação de Cadastros</h1>

            {error && (
                <Alert className="mb-6 bg-red-500/20 border-red-500/50 text-red-100">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {profiles.length === 0 ? (
                <Card className="glass-dark border-white/20">
                    <CardContent className="p-12 text-center">
                        <p className="text-purple-200">
                            ✅ Nenhum cadastro pendente de aprovação no momento
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {profiles.map((profile) => (
                        <Card key={profile.user_id} className="glass-dark border-white/20">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4 flex-1">
                                        <Avatar className="h-16 w-16">
                                            <AvatarImage src={profile.photo_url} />
                                            <AvatarFallback className="bg-purple-600 text-white text-xl">
                                                {profile.full_name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-white">
                                                {profile.full_name}
                                            </h3>
                                            <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-purple-200">
                                                <div className="flex items-center">
                                                    <Phone className="mr-2 h-4 w-4" />
                                                    {profile.phone}
                                                </div>
                                                <div className="flex items-center">
                                                    <Calendar className="mr-2 h-4 w-4" />
                                                    {new Date(profile.birth_date).toLocaleDateString('pt-BR')}
                                                </div>
                                                <div className="flex items-center">
                                                    <Building className="mr-2 h-4 w-4" />
                                                    Torre {profile.tower}{profile.block ? ` - Bloco ${profile.block}` : ''}
                                                </div>
                                                <div className="flex items-center">
                                                    <Home className="mr-2 h-4 w-4" />
                                                    Apto {profile.apartment}
                                                </div>
                                            </div>
                                            <p className="text-xs text-purple-300 mt-2">
                                                Cadastrado em: {new Date(profile.created_at).toLocaleDateString('pt-BR')} às{' '}
                                                {new Date(profile.created_at).toLocaleTimeString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-2 ml-4">
                                        <Button
                                            onClick={() => handleApprove(profile.user_id)}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                            disabled={processingId === profile.user_id}
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Aprovar
                                        </Button>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="bg-red-600/20 border-red-500/50 text-red-100 hover:bg-red-600/30"
                                                    disabled={processingId === profile.user_id}
                                                >
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    Rejeitar
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="glass-dark border-white/20">
                                                <DialogHeader>
                                                    <DialogTitle className="text-white">
                                                        Rejeitar Cadastro
                                                    </DialogTitle>
                                                    <DialogDescription className="text-purple-200">
                                                        Informe o motivo da rejeição para {profile.full_name}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <textarea
                                                        value={rejectReason}
                                                        onChange={(e) => setRejectReason(e.target.value)}
                                                        placeholder="Motivo da rejeição..."
                                                        className="w-full p-3 bg-white/10 border border-white/20 rounded-md text-white placeholder:text-purple-200 min-h-[100px]"
                                                        disabled={processingId === profile.user_id}
                                                    />
                                                    <Button
                                                        onClick={() => handleReject(profile.user_id)}
                                                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                                                        disabled={processingId === profile.user_id || !rejectReason.trim()}
                                                    >
                                                        {processingId === profile.user_id ? 'Rejeitando...' : 'Confirmar Rejeição'}
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
