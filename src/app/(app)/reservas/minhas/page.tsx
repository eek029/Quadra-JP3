'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/app/actions/auth';
import { getUserReservations, cancelReservation } from '@/app/actions/reservation';
import { ReservationCard } from '@/components/reservations/ReservationCard';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MinhasReservasPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [reservations, setReservations] = useState<any[]>([]);
    const [error, setError] = useState('');

    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelDialog, setShowCancelDialog] = useState(false);

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

            setUser(currentUser);

            const userReservations = await getUserReservations(currentUser.id);
            setReservations(userReservations);
        } catch (err) {
            setError('Erro ao carregar reservas');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClick = (id: string) => {
        setCancellingId(id);
        setShowCancelDialog(true);
    };

    const handleConfirmCancel = async () => {
        if (!cancellingId) return;

        try {
            const result = await cancelReservation(user.id, cancellingId, cancelReason);

            if (!result.success) {
                setError(result.error || 'Erro ao cancelar reserva');
            } else {
                await loadData();
                setShowCancelDialog(false);
                setCancellingId(null);
                setCancelReason('');
            }
        } catch (err) {
            setError('Erro inesperado ao cancelar reserva');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-white">Carregando...</div>
            </div>
        );
    }

    const futureReservations = reservations.filter(
        (r) => new Date(r.starts_at) > new Date() && r.status === 'confirmed'
    );

    const pastReservations = reservations.filter(
        (r) => new Date(r.starts_at) <= new Date() || r.status !== 'confirmed'
    );

    return (
        <div className="container max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-white mb-6">Minhas Reservas</h1>

            {error && (
                <Alert className="mb-6 bg-red-500/20 border-red-500/50 text-red-100">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue="futuras" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 bg-white/10">
                    <TabsTrigger value="futuras" className="data-[state=active]:bg-purple-600">
                        Futuras ({futureReservations.length})
                    </TabsTrigger>
                    <TabsTrigger value="passadas" className="data-[state=active]:bg-purple-600">
                        Histórico ({pastReservations.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="futuras">
                    <Card className="glass-dark border-white/20">
                        <CardHeader>
                            <CardTitle className="text-xl text-white">Próximas Reservas</CardTitle>
                            <CardDescription className="text-purple-200">
                                Suas reservas confirmadas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {futureReservations.length === 0 ? (
                                <div className="text-center py-8">
                                    <AlertCircle className="h-12 w-12 text-purple-300 mx-auto mb-3" />
                                    <p className="text-purple-200">Você não tem reservas futuras</p>
                                    <Button
                                        onClick={() => router.push('/reservas/nova')}
                                        className="mt-4 bg-gradient-purple hover:bg-gradient-purple-hover"
                                    >
                                        Fazer uma reserva
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {futureReservations.map((reservation) => (
                                        <ReservationCard
                                            key={reservation.id}
                                            reservation={reservation}
                                            onCancel={handleCancelClick}
                                            showCancelButton
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="passadas">
                    <Card className="glass-dark border-white/20">
                        <CardHeader>
                            <CardTitle className="text-xl text-white">Histórico</CardTitle>
                            <CardDescription className="text-purple-200">
                                Reservas passadas e canceladas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pastReservations.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-purple-200">Nenhuma reserva no histórico</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pastReservations.map((reservation) => (
                                        <ReservationCard
                                            key={reservation.id}
                                            reservation={reservation}
                                            showCancelButton={false}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Cancel Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent className="glass-dark border-white/20">
                    <DialogHeader>
                        <DialogTitle className="text-white">Cancelar Reserva</DialogTitle>
                        <DialogDescription className="text-purple-200">
                            Tem certeza que deseja cancelar esta reserva?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="reason" className="text-sm font-medium text-white">
                                Motivo (opcional)
                            </label>
                            <textarea
                                id="reason"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Por que você está cancelando?"
                                className="w-full p-3 bg-white/10 border border-white/20 rounded-md text-white placeholder:text-purple-200 min-h-[100px]"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowCancelDialog(false);
                                setCancellingId(null);
                                setCancelReason('');
                            }}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                            Voltar
                        </Button>
                        <Button
                            onClick={handleConfirmCancel}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Confirmar Cancelamento
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
