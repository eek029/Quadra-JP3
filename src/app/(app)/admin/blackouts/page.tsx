'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, Trash2, Plus, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getUser, getProfile } from '@/app/actions/auth';
import { getBlackoutPeriods, createBlackoutPeriod, deleteBlackoutPeriod } from '@/app/actions/blackout';

export default function AdminBlackoutsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [blackouts, setBlackouts] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form fields
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('22:00');
    const [reason, setReason] = useState('');

    // Delete dialog
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const currentUser = await getUser();
            if (!currentUser) {
                router.push('/login');
                return;
            }

            const profile = await getProfile(currentUser.id);
            if (!profile) {
                router.push('/perfil');
                return;
            }

            // Check permissions
            const allowedRoles = ['sub_manager', 'general_manager', 'dev_admin'];
            if (!allowedRoles.includes(profile.role)) {
                router.push('/dashboard');
                return;
            }

            setUser(currentUser);

            // Load blackouts for next 30 days
            const today = new Date();
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 30);

            const data = await getBlackoutPeriods(
                today.toISOString().split('T')[0],
                futureDate.toISOString().split('T')[0]
            );
            setBlackouts(data);
        } catch (err) {
            setError('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBlackout = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            // Validate
            if (!date || !startTime || !endTime || !reason.trim()) {
                setError('Preencha todos os campos');
                setSubmitting(false);
                return;
            }

            // Create timestamps
            const startsAt = new Date(`${date}T${startTime}:00-03:00`);
            const endsAt = new Date(`${date}T${endTime}:00-03:00`);

            if (endsAt <= startsAt) {
                setError('Horário de término deve ser posterior ao início');
                setSubmitting(false);
                return;
            }

            const result = await createBlackoutPeriod(user.id, {
                startsAt: startsAt.toISOString(),
                endsAt: endsAt.toISOString(),
                reason: reason.trim(),
            });

            if (!result.success) {
                setError(result.error || 'Erro ao criar bloqueio');
            } else {
                setSuccess('Bloqueio criado com sucesso!');
                setDate('');
                setStartTime('09:00');
                setEndTime('22:00');
                setReason('');
                await loadData();
            }
        } catch (err) {
            setError('Erro inesperado ao criar bloqueio');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        setSubmitting(true);
        setError('');

        try {
            const result = await deleteBlackoutPeriod(user.id, deleteId);

            if (!result.success) {
                setError(result.error || 'Erro ao excluir bloqueio');
            } else {
                setSuccess('Bloqueio excluído com sucesso!');
                await loadData();
            }
        } catch (err) {
            setError('Erro inesperado ao excluir');
        } finally {
            setSubmitting(false);
            setShowDeleteDialog(false);
            setDeleteId(null);
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
        <div className="container max-w-6xl mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold text-white">Bloqueios (Blackouts)</h1>

            {error && (
                <Alert className="bg-red-500/20 border-red-500/50 text-red-100">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="bg-green-500/20 border-green-500/50 text-green-100">
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Create Form */}
                <Card className="glass-dark border-white/20 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-xl text-white flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Criar Bloqueio
                        </CardTitle>
                        <CardDescription className="text-purple-200">
                            Bloquear período da quadra
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateBlackout} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="date" className="text-sm font-medium text-white">
                                    Data *
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-200" />
                                    <Input
                                        id="date"
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="pl-10 bg-white/10 border-white/20 text-white"
                                        required
                                        disabled={submitting}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label htmlFor="startTime" className="text-sm font-medium text-white">
                                        Início *
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-200" />
                                        <Input
                                            id="startTime"
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="pl-10 bg-white/10 border-white/20 text-white"
                                            required
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="endTime" className="text-sm font-medium text-white">
                                        Fim *
                                    </label>
                                    <Input
                                        id="endTime"
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                        required
                                        disabled={submitting}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="reason" className="text-sm font-medium text-white">
                                    Motivo *
                                </label>
                                <textarea
                                    id="reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Ex: Manutenção da quadra"
                                    className="w-full p-3 bg-white/10 border border-white/20 rounded-md text-white placeholder:text-purple-200 min-h-[100px]"
                                    required
                                    disabled={submitting}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-purple hover:bg-gradient-purple-hover text-white"
                                disabled={submitting}
                            >
                                {submitting ? 'Criando...' : 'Criar Bloqueio'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* List */}
                <Card className="glass-dark border-white/20 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-xl text-white">Bloqueios Ativos</CardTitle>
                        <CardDescription className="text-purple-200">
                            Próximos 30 dias
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {blackouts.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                                <p className="text-purple-200">Nenhum bloqueio ativo</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {blackouts.map((blackout) => (
                                    <Card key={blackout.id} className="bg-white/5 border-white/20">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Calendar className="h-4 w-4 text-red-300" />
                                                        <span className="text-white font-semibold">
                                                            {format(new Date(blackout.starts_at), "dd 'de' MMMM", { locale: ptBR })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Clock className="h-4 w-4 text-red-300" />
                                                        <span className="text-purple-200">
                                                            {format(new Date(blackout.starts_at), 'HH:mm')} -{' '}
                                                            {format(new Date(blackout.ends_at), 'HH:mm')}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-purple-200 bg-white/5 rounded p-2">
                                                        <strong>Motivo:</strong> {blackout.reason}
                                                    </p>
                                                    {blackout.profiles && (
                                                        <p className="text-xs text-purple-300 mt-2">
                                                            Criado por: {blackout.profiles.full_name}
                                                        </p>
                                                    )}
                                                </div>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setDeleteId(blackout.id);
                                                        setShowDeleteDialog(true);
                                                    }}
                                                    disabled={submitting}
                                                    className="ml-4 bg-red-600/20 border-red-500/50 text-red-100 hover:bg-red-600/30"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="glass-dark border-white/20">
                    <DialogHeader>
                        <DialogTitle className="text-white">Excluir Bloqueio</DialogTitle>
                        <DialogDescription className="text-purple-200">
                            Tem certeza que deseja excluir este bloqueio? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={submitting}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={submitting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {submitting ? 'Excluindo...' : 'Confirmar Exclusão'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
