'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Filter, XCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getUser, getProfile } from '@/app/actions/auth';
import { getAllReservations, cancelReservation } from '@/app/actions/reservation';

export default function AdminReservasPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [reservations, setReservations] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Filters
    const [filterDate, setFilterDate] = useState<string>('today');
    const [filterStatus, setFilterStatus] = useState<string>('confirmed');
    const [filterTower, setFilterTower] = useState<string>('');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // Cancel dialog
    const [cancelId, setCancelId] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (profile) {
            applyFilters();
        }
    }, [filterDate, filterStatus, filterTower, customStartDate, customEndDate, profile]);

    const loadData = async () => {
        try {
            const currentUser = await getUser();
            if (!currentUser) {
                router.push('/login');
                return;
            }

            const currentProfile = await getProfile(currentUser.id);
            if (!currentProfile) {
                router.push('/perfil');
                return;
            }

            // Check permissions
            const allowedRoles = ['doorman', 'sub_manager', 'general_manager', 'dev_admin'];
            if (!allowedRoles.includes(currentProfile.role)) {
                router.push('/dashboard');
                return;
            }

            setUser(currentUser);
            setProfile(currentProfile);
        } catch (err) {
            setError('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = async () => {
        let startDate: string | undefined;
        let endDate: string | undefined;

        const today = new Date();

        if (filterDate === 'today') {
            startDate = today.toISOString().split('T')[0];
            endDate = today.toISOString().split('T')[0];
        } else if (filterDate === '7days') {
            startDate = today.toISOString().split('T')[0];
            const future = new Date(today);
            future.setDate(future.getDate() + 7);
            endDate = future.toISOString().split('T')[0];
        } else if (filterDate === 'custom') {
            startDate = customStartDate || undefined;
            endDate = customEndDate || undefined;
        }

        const filters: any = {
            startDate,
            endDate,
            status: filterStatus || undefined,
        };

        // Role-based tower filtering
        if (profile.role === 'doorman' || profile.role === 'sub_manager') {
            filters.tower = profile.tower;
        } else if (profile.role === 'general_manager' && filterTower) {
            filters.tower = parseInt(filterTower);
        }

        const data = await getAllReservations(filters);
        setReservations(data);
    };

    const handleCancelClick = (id: string) => {
        setCancelId(id);
        setShowCancelDialog(true);
    };

    const handleConfirmCancel = async () => {
        if (!cancelId || !cancelReason.trim()) {
            setError('Motivo é obrigatório');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const result = await cancelReservation(user.id, cancelId, cancelReason, true);

            if (!result.success) {
                setError(result.error || 'Erro ao cancelar reserva');
            } else {
                setSuccess('Reserva cancelada com sucesso!');
                await applyFilters();
                setShowCancelDialog(false);
                setCancelId(null);
                setCancelReason('');
            }
        } catch (err) {
            setError('Erro inesperado ao cancelar');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-white">Carregando...</div>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <Badge className="bg-green-600">Confirmada</Badge>;
            case 'cancelled':
                return <Badge variant="outline" className="border-yellow-500 text-yellow-300">Cancelada</Badge>;
            case 'admin_cancelled':
                return <Badge variant="outline" className="border-red-500 text-red-300">Cancelada (Admin)</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="container max-w-6xl mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold text-white">Gestão de Reservas</h1>

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

            {/* Filters */}
            <Card className="glass-dark border-white/20">
                <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtros
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Período</label>
                            <select
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="w-full h-10 bg-white/10 border border-white/20 rounded-md text-white px-3"
                            >
                                <option value="today" className="bg-purple-900">Hoje</option>
                                <option value="7days" className="bg-purple-900">Próximos 7 dias</option>
                                <option value="custom" className="bg-purple-900">Personalizado</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full h-10 bg-white/10 border border-white/20 rounded-md text-white px-3"
                            >
                                <option value="" className="bg-purple-900">Todos</option>
                                <option value="confirmed" className="bg-purple-900">Confirmadas</option>
                                <option value="cancelled" className="bg-purple-900">Canceladas</option>
                                <option value="admin_cancelled" className="bg-purple-900">Canceladas (Admin)</option>
                            </select>
                        </div>

                        {profile?.role === 'general_manager' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Torre</label>
                                <select
                                    value={filterTower}
                                    onChange={(e) => setFilterTower(e.target.value)}
                                    className="w-full h-10 bg-white/10 border border-white/20 rounded-md text-white px-3"
                                >
                                    <option value="" className="bg-purple-900">Todas</option>
                                    <option value="1" className="bg-purple-900">Torre 1</option>
                                    <option value="2" className="bg-purple-900">Torre 2</option>
                                    <option value="3" className="bg-purple-900">Torre 3</option>
                                    <option value="4" className="bg-purple-900">Torre 4</option>
                                    <option value="5" className="bg-purple-900">Torre 5</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {filterDate === 'custom' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Data Início</label>
                                <Input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="bg-white/10 border-white/20 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Data Fim</label>
                                <Input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="bg-white/10 border-white/20 text-white"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Reservations List */}
            <Card className="glass-dark border-white/20">
                <CardHeader>
                    <CardTitle className="text-xl text-white">Reservas</CardTitle>
                    <CardDescription className="text-purple-200">
                        Total: {reservations.length} reserva(s)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {reservations.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                            <p className="text-purple-200">Nenhuma reserva encontrada com os filtros selecionados</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reservations.map((reservation) => (
                                <Card key={reservation.id} className="bg-white/5 border-white/20">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-white font-semibold">
                                                        {format(new Date(reservation.starts_at), "dd/MM/yyyy", { locale: ptBR })}
                                                    </span>
                                                    <span className="text-purple-200">
                                                        {format(new Date(reservation.starts_at), 'HH:mm')} - {format(new Date(reservation.ends_at), 'HH:mm')}
                                                    </span>
                                                    {getStatusBadge(reservation.status)}
                                                </div>
                                                <div className="text-sm text-purple-200">
                                                    <strong>Morador:</strong> {reservation.profiles?.full_name || 'N/A'}
                                                </div>
                                                <div className="text-sm text-purple-200">
                                                    <strong>Unidade:</strong> Torre {reservation.profiles?.tower}
                                                    {reservation.profiles?.block && ` - Bloco ${reservation.profiles.block}`} - Apto {reservation.profiles?.apartment}
                                                </div>
                                                {reservation.notes && (
                                                    <div className="text-sm text-purple-200 mt-2 bg-white/5 rounded p-2">
                                                        <strong>Observações:</strong> {reservation.notes}
                                                    </div>
                                                )}
                                                {reservation.cancel_reason && (
                                                    <div className="text-sm text-red-200 mt-2 bg-red-500/10 rounded p-2">
                                                        <strong>Motivo do cancelamento:</strong> {reservation.cancel_reason}
                                                    </div>
                                                )}
                                            </div>

                                            {reservation.status === 'confirmed' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleCancelClick(reservation.id)}
                                                    disabled={submitting}
                                                    className="ml-4 bg-red-600/20 border-red-500/50 text-red-100 hover:bg-red-600/30"
                                                >
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Cancelar
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Cancel Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent className="glass-dark border-white/20">
                    <DialogHeader>
                        <DialogTitle className="text-white">Cancelar Reserva (Admin)</DialogTitle>
                        <DialogDescription className="text-purple-200">
                            O usuário receberá uma notificação sobre o cancelamento.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="cancelReason" className="text-sm font-medium text-white">
                                Motivo do cancelamento *
                            </label>
                            <textarea
                                id="cancelReason"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Ex: Manutenção emergencial da quadra"
                                className="w-full p-3 bg-white/10 border border-white/20 rounded-md text-white placeholder:text-purple-200 min-h-[100px]"
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowCancelDialog(false);
                                setCancelId(null);
                                setCancelReason('');
                            }}
                            disabled={submitting}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                            Voltar
                        </Button>
                        <Button
                            onClick={handleConfirmCancel}
                            disabled={submitting || !cancelReason.trim()}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {submitting ? 'Cancelando...' : 'Confirmar Cancelamento'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
